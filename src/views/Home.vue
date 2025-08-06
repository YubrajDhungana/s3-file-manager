<template>
    <div id="home">
        <!-- Header -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-cloud me-2"></i>
                    S3 File Manager
                </a>

                <!-- NEW: User info and logout button -->
                <div class="navbar-nav ms-auto">
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown"
                            role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user-circle me-2"></i>
                            {{ currentUser.name }}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <span class="dropdown-item-text">
                                    <small class="text-muted">{{ currentUser.email }}</small>
                                </span>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <button class="dropdown-item" @click="handleLogout">
                                    <i class="fas fa-sign-out-alt me-2"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container-fluid py-4">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-lg-3 col-md-4 mb-4">
                    <div class="card card-custom">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-cog me-2"></i>
                                Configuration
                            </h5>

                            <!-- Account Selector -->
                            <div class="mb-3">
                                <AccountSelector :selected-account="selectedAccount"
                                    @account-change="handleAccountChange" :accounts="accounts" />
                            </div>

                            <!-- Bucket Selector -->
                            <div class="mb-3">
                                <BucketSelector :selected-bucket="selectedBucket" :selected-account="selectedAccount"
                                    @bucket-change="handleBucketChange" :buckets="buckets" :loading="loadingBuckets" />
                            </div>

                            <!-- Search Filter -->
                            <!-- <div class="mb-3">
                                <SearchFilter :disabled="!selectedBucket || !selectedAccount" @search="handleSearch" />
                            </div> -->
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="col-lg-9 col-md-8">
                    <div v-if="selectedAccount && selectedBucket" class="card card-custom mb-4">
                        <div class="card-body">
                            <FolderNavigation :current-path="currentPath" :selected-bucket="selectedBucket"
                                @path-change="handlePathChange" />
                        </div>
                    </div>

                    <!-- File List -->
                    <div class="card card-custom">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-folder me-2"></i>
                                Files
                                <span class="badge bg-secondary ms-2">{{ currentItems?.length }}</span>
                            </h5>
                            <FileList ref="fileList" :items="currentItems" @file-rename="handleFileRename"
                                @file-delete="handleFileDelete" :current-path="currentPath" :loading="loading"
                                :is-truncated="isTruncated" @load-data="handleLoadData"
                                @folder-double-click="handleFolderDoubleClick" @bulk-delete="handleBulkDelete"
                                :disabled="!selectedBucket || !selectedAccount" @search="handleSearch" />
                        </div>
                    </div>

                    <div class="card card-custom mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-upload me-2"></i>
                                File Upload
                            </h5>
                            <FileUpload ref="fileUpload" :disabled="!selectedAccount || !selectedBucket"
                                @file-upload="handleFileUpload" />
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>
</template>
<script>
import AccountSelector from "../components/AccountSelector.vue";
import BucketSelector from "../components/BucketSelector.vue";
import FileUpload from "../components/FileUpload.vue";
import FileList from "../components/FileList.vue";
//import SearchFilter from "../components/SearchFilter.vue";
import FolderNavigation from "../components/FolderNavigation.vue";
import api from '../utils/api'

export default {
    name: "HomePage",
    components: {
        AccountSelector,
        BucketSelector,
        FileUpload,
        FileList,
        //SearchFilter,
        FolderNavigation
    },
    data() {
        return {
            selectedAccount: "",
            selectedBucket: "",
            currentPath: '',
            searchQuery: '',
            nextContinuationToken: null,
            isTruncated: false,
            keyCount: 0,
            accounts: [],
            buckets: [],
            currentItems: [],
            loading: false,
            perPage: 10,
            loadingBuckets: false,
            currentUser: {
                name: '',
                email: ''
            },
        };
    },
    mounted() {
        this.loadAccounts();
        this.authStatus();
    },
    methods: {

        async authStatus() {
            console.log(" the auth status method is called")
            try {
                const response = await api.get('/auth/check-auth');
                console.log("auth status response: ", response.data);
                if (response.data.authenticated) {
                    this.currentUser = {
                        name: response.data.name || '',
                        email: response.data.email || ''
                    }
                }
                console.log("current user: ", this.currentUser);
            } catch (error) {
                if (error.response?.status === 401) {
                    // this.handleLogout(); // Force logout if token is invalid
                    alert("session expired.Please login again");
                    this.$router.push({ name: 'Login' });

                }
            }
        },

        async loadAccounts() {
            this.accounts = [{ id: "acc1", name: "Account 1", region: "us-east-1" }];
        },
        async handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                await api.post('/auth/logout')
                    .finally(() => {
                        this.$router.push({ name: 'Login' });
                    })
            }
        },

        async loadBuckets() {
            try {
                this.loadingBuckets = true;
                const response = await api.get('/buckets/list-buckets', {
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log("Buckets response:", response.data);
                this.buckets = response.data || [];
            } catch (error) {
                console.error("Error loading buckets:", error);
                if (error.response?.data?.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error loading buckets:", error);
                    alert("Error loading buckets. Please try again.");
                }
                this.buckets = [];

            } finally {
                this.loadingBuckets = false;
            }
        },
        handleLoadData(params) {
            this.perPage = params.limit;
            this.loadFolderContents(params);
        },

        async handleSearch(searchQuery) {
            try {

                this.currentItems = [];
                const id = this.selectedBucket;
                if (!searchQuery.trim()) {
                    this.loadFolderContents({ path: this.currentPath })
                } else {
                    this.loading = true;
                    const response = await api.get(`/files/${id}/search-files`, {
                        params: {
                            folder: this.currentPath,
                            search: searchQuery
                        },
                        headers: {
                            "authorization": `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    if (!response.data || response.data.items?.length === 0) {
                        this.currentPath = '';
                        return;
                    }
                    this.currentItems = response.data.items;
                    this.isTruncated = response.data.isTruncated;
                    this.nextContinuationToken = response.data.continuationToken || '';
                    console.log("current path", this.currentPath);
                    console.log("Loaded folder contents:", this.currentItems);
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error loading folder contents:", error);
                    alert("Error loading folder contents.");
                }

            } finally {
                if (searchQuery.trim() !== '') {
                    this.loading = false;
                }
            }
        },

        async loadFolderContents(params = {}) {
            try {
                this.loading = true;
                const id = this.selectedBucket;
                const requestParams = {
                    limit: this.perPage,
                    continuationToken: params.continuationToken || '',
                    folder: params.path || params.searchQuery
                };
                const response = await api.get(`/files/${id}/listByFolder`, {
                    params: requestParams,
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (!response.data || response.data.items?.length === 0) {
                    this.currentItems = [];
                    if (params.searchQuery && (!response.data || response.data.items.length === 0)) {
                        this.currentPath = "";
                    }
                    return;
                }

                this.currentItems = response.data.items;
                this.isTruncated = response.data.isTruncated || false;
                this.nextContinuationToken = response.data.nextContinuationToken || '';


                // Update the FileList component with the new pagination token
                if (this.$refs.fileList && this.nextContinuationToken) {
                    this.$refs.fileList.updatePaginationToken(this.nextContinuationToken);
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                }
                this.currentItems = []
                if (params.searchQuery) {
                    this.currentPath = "";
                }
            } finally {
                this.loading = false;
            }
        },

        async handleFileUpload(uploadedFiles) {
            try {
                this.$refs.fileUpload.isUploading = true;
                this.$refs.fileUpload.totalFiles = uploadedFiles.length;
                this.$refs.fileUpload.currentFile = 0;
                const formData = new FormData();

                // Appending single file or multiple files
                Array.from(uploadedFiles).forEach(file => {
                    formData.append('files', file);
                });
                const id = this.selectedBucket;
                let uploadPath;
                if (this.currentPath) {
                    if (this.currentPath === '/') {
                        uploadPath = '/';
                    } else {
                        uploadPath = `${this.currentPath}/`;
                    }
                }
                //const uploadPath = this.currentPath ? `${this.currentPath}/` : '';
                console.log('currentPath:', this.currentPath);
                console.log("Upload path:", uploadPath);
                formData.append('key', uploadPath)
                console.log("Uploading files to path:", uploadPath);
                await api.post(`/files/${id}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            console.log(`Upload progress: ${progress}`)
                            this.$refs.fileUpload.currentFile += 1;
                            this.$refs.fileUpload.updateProgress(progress, this.$refs.fileUpload.currentFile, this.$refs.fileUpload.totalFiles)
                            // Update progress in FileUpload component
                            this.$refs.fileUpload.updateProgress(progress);
                        }
                    }

                });

                // Reload the current folder contents after upload
                this.loadFolderContents({ path: this.currentPath });
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error('Error uploading files:', error);
                    alert("Error uploading files. Please try again.");
                }

            } finally {
                this.$refs.fileUpload.isUploading = false;
                this.$refs.fileUpload.resetProgress();
            }
        },

        handleAccountChange(accountId) {
            this.selectedAccount = accountId;
            this.buckets = [];
            this.currentPath = ''
            this.currentItems = []
            this.loadBuckets();
        },

        handleBucketChange(bucketId) {
            this.selectedBucket = bucketId;
            this.currentPath = ''
            if (bucketId) {
                this.loadFolderContents({ continuationToken: this.nextContinuationToken, folder: this.currentPath })
            } else {
                this.currentItems = []
            }
        },

        handlePathChange(newPath) {
            this.currentPath = newPath
            console.log("new path", this.currentPath)
            this.loadFolderContents({ path: this.currentPath })
        },

        async handleFileRename(oldKey, newKey) {
            try {
                const id = this.selectedBucket;
                await api.patch(`/files/${id}/rename`, {
                    oldKey: oldKey,
                    newKey: newKey,
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                this.loadFolderContents({ path: this.currentPath });
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                } else {


                    console.log("Error renaming file:", error);
                    alert("Error renaming file.");
                }
            }
        },

        async handleFileDelete(key) {
            try {
                const id = this.selectedBucket;
                const response = await api.delete(`/files/${id}`, {
                    data: {
                        filePaths: [key]
                    },
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.message === "Files deleted successfully") {
                    this.loadFolderContents({ path: this.currentPath });
                } else {
                    alert("Error deleting file.");
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error deleting file:", error);
                    alert("Error deleting file.");
                }

            }
        },

        async handleBulkDelete(fileKeys) {
            try {
                const id = this.selectedBucket;
                const response = await api.delete(`/files/${id}`, {
                    data: {
                        filePaths: fileKeys
                    },
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.message === "Files deleted successfully") {
                    this.loadFolderContents({ path: this.currentPath });
                } else {
                    alert("Error deleting selected files.");
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                } else {
                    alert("Error deleting selected files.");
                }
            }
        },
        //handle folder double click to navigate
        handleFolderDoubleClick(folderName) {
            if (folderName === '/') {
                this.currentPath = '/';
            } else if (this.currentPath === '') {
                this.currentPath = folderName;
            } else if (this.currentPath.endsWith('/')) {
                this.currentPath += folderName;
            } else {
                this.currentPath += `/${folderName}`;
            }
            this.loadFolderContents({ path: this.currentPath });

        },

    },
};
</script>

<style scoped>
#home {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.navbar-brand {
    font-weight: 600;
}

/* .card-custom {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border-radius: 0.5rem;
} */

.card-title {
    color: #495057;
    font-weight: 600;
}

.badge {
    font-size: 0.75rem;
}

.dropdown-toggle::after {
    margin-left: 0.5rem;
}

.nav-link {
    color: rgba(255, 255, 255, 0.75) !important;
}

.nav-link:hover {
    color: rgba(255, 255, 255, 1) !important;
}
</style>
