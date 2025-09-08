<template>
    <div id="home">
        <!-- Header -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-cloud me-2"></i>
                    S3 File Manager
                </a>

                <!-- User info and logout button -->
                <div class="navbar-nav ms-auto">
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown"
                            role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user-circle me-2"></i>
                            <!-- {{ currentUser.name }} -->
                            {{ authStore.user?.name || 'User' }}
                            <span v-if="isSuperAdmin" class="badge bg-info-subtle ms-2 text-dark">Super Admin</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <span class="dropdown-item-text">
                                    <!-- <small class="text-muted">{{ currentUser.email }}</small> -->
                                    <small class="text-muted">{{ authStore.user?.email }}</small>
                                    <br>
                                    <!-- <small v-if="currentUser.userType" class="text-info">{{currentUser.userType }}</small> -->
                                    <small v-if="authStore.user?.user_type" class="text-info">{{
                                        authStore.user.user_type }}</small>
                                </span>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li v-if="isSuperAdmin">
                                <button class="dropdown-item" @click="toggleAdminPanel">
                                    <i class="fas fa-cog me-2"></i>
                                    {{ showAdminPanel ? 'Hide Admin' : 'Admin Panel' }}
                                </button>
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
            <AdminPanel v-if="showAdminPanel && isSuperAdmin" :is-super-admin="isSuperAdmin" :accounts="accounts"
                :buckets="buckets" />
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
                                    @account-change="handleAccountChange" :accounts="accounts"
                                    :loading="loadingAccounts" />
                            </div>

                            <!-- Bucket Selector -->
                            <div class="mb-3">
                                <BucketSelector :selected-bucket="selectedBucket" :selected-account="selectedAccount"
                                    @bucket-change="handleBucketChange" :buckets="buckets" :loading="loadingBuckets" />
                            </div>
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
                            <FileList ref="fileList" :items="currentItems" @file-delete="handleFileDelete"
                                :current-path="currentPath" :loading="loading" :is-truncated="isTruncated"
                                @load-data="handleLoadData" @folder-double-click="handleFolderDoubleClick"
                                @bulk-delete="handleBulkDelete" :disabled="!selectedBucket || !selectedAccount"
                                @search="handleSearch" @file-download="handleFileDownload"
                                @path-change="handlePathChange" />
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
import FolderNavigation from "../components/FolderNavigation.vue";
import AdminPanel from "@/components/AdminPanel.vue";
import api from '../utils/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from "vue-toastification";
export default {
    name: "HomePage",
    components: {
        AccountSelector,
        BucketSelector,
        FileUpload,
        FileList,
        FolderNavigation,
        AdminPanel
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
            loadingAccounts: false,
            showAdminPanel: false
        };
    },
    setup() {
        const authStore = useAuthStore()
        const toast = useToast()

        return {
            authStore,
            toast
        }
    },
    computed: {
        isSuperAdmin() {
            return this.authStore.user?.user_type === 'superadmin';
        }
    },
    mounted() {
        this.loadAccounts();
    },
    methods: {
        toggleAdminPanel() {
            this.showAdminPanel = !this.showAdminPanel;
        },

        async handleLogout() {
            // const toast = useToast();
            // try {
            //     if (confirm('Are you sure you want to logout?')) {
            //         await api.post('/auth/logout')
            //         toast.success("Logged out successfully");
            //         this.$router.push({ name: 'Login' });
            //     }
            // } catch (error) {
            //     if (error.response?.status === 401) {
            //         this.$router.push({ name: 'Login' });
            //     } else {
            //         toast.error("Logout failed. Please try again.");
            //     }
            // }
            if (confirm('Are you sure you want to logout?')) {
                await this.authStore.logout()
            }
        },

        async handleFileDownload(item) {
            const toast = useToast()
            try {
                const id = this.selectedAccount;
                const response = await api.get(`/files/${id}/download`, {
                    params: { key: item.key, bucketName: this.selectedBucket },
                    responseType: 'blob'
                })

                // Create download link
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', item.name);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                toast.error('Download failed');
            }
        },

        async loadAccounts() {
            const toast = useToast();
            try {
                this.loadingAccounts = true;
                const response = await api.get('/accounts/');
                this.accounts = response.data || []
            } catch (error) {
                console.error("Error loading buckets:", error.response?.data?.message);
                if (error.response?.data?.message === "Invalid token" || error.response?.data?.message === "Token revoked") {
                    toast.error("Session expired. Please login again.");
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error loading accounts:", error);
                }
                this.accounts = [];
            } finally {
                this.loadingAccounts = false;
            }
        },
        async loadBuckets() {
            try {
                this.loadingBuckets = true;
                const id = this.selectedAccount;
                if (!id) {
                    this.buckets = [];
                    return;
                }
                const response = await api.get(`/buckets/${id}/list-buckets`);
                this.buckets = response.data || [];
            } catch (error) {
                console.error("Error loading buckets:", error);
                if (error.response?.data?.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error loading buckets:", error);
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
                const id = this.selectedAccount;
                if (!searchQuery.trim()) {
                    this.loadFolderContents({ path: this.currentPath })
                } else {
                    this.loading = true;
                    const response = await api.get(`/files/${id}/search-files`, {
                        params: {
                            folder: this.currentPath,
                            search: searchQuery,
                            bucketName: this.selectedBucket
                        }
                    })
                    if (!response.data || response.data.items?.length === 0) {
                        this.currentPath = '';
                        return;
                    }
                    this.currentItems = response.data.items;
                    this.isTruncated = response.data.isTruncated;
                    this.nextContinuationToken = response.data.continuationToken || '';
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error loading folder contents:", error);
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
                const id = this.selectedAccount;
                const requestParams = {
                    limit: this.perPage,
                    continuationToken: params.continuationToken || '',
                    folder: params.path || params.searchQuery,
                    bucketName: this.selectedBucket
                };
                const response = await api.get(`/files/${id}/listByFolder`, {
                    params: requestParams
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
                const id = this.selectedAccount;
                let uploadPath = '';
                if (this.currentPath) {
                    if (this.currentPath === '/') {
                        uploadPath = '/';
                    } else {
                        uploadPath = `${this.currentPath}/`;
                    }
                }
                //const uploadPath = this.currentPath ? `${this.currentPath}/` : '';
                formData.append('bucketName', this.selectedBucket);
                formData.append('key', uploadPath)
                console.log("Uploading files to path:", uploadPath);
                await api.post(`/files/${id}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
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
            console.log('Account changed to:', accountId);
            this.selectedAccount = accountId;
            this.buckets = [];
            this.currentPath = ''
            this.selectedBucket = '';
            this.currentItems = []
            this.loadingBuckets = true;
            if (accountId) {
                this.loadBuckets();
            } else {
                this.loadingBuckets = false;
            }
        },

        handleBucketChange(bucketName) {
            this.selectedBucket = bucketName;
            this.currentPath = ''
            if (bucketName) {
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
        async handleFileDelete(key) {
            const toast = useToast();
            try {
                const id = this.selectedAccount;
                const response = await api.delete(`/files/${id}`, {
                    data: {
                        filePaths: [key],
                        bucketName: this.selectedBucket
                    }
                });
                if (response.data.message === "Files deleted successfully") {
                    toast.success(response.data.message);
                    this.loadFolderContents({ path: this.currentPath });
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    alert("session expired.Please login again");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push({ name: 'Login' });
                } else {
                    console.error("Error deleting file:", error);
                }

            }
        },

        async handleBulkDelete(fileKeys) {
            const toast = useToast();
            try {
                const id = this.selectedAccount;
                const response = await api.delete(`/files/${id}`, {
                    data: {
                        filePaths: fileKeys,
                        bucketName: this.selectedBucket
                    },
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.message === "Files deleted successfully") {
                    toast.success(response.data.message);
                    this.loadFolderContents({ path: this.currentPath });
                } else {
                    toast.error("Error deleting selected files.");
                }
            } catch (error) {
                if (error.response.data.message === "Invalid token" || error.response?.status === 401) {
                    toast.error("session expired.Please login again");
                    this.$router.push({ name: 'Login' });
                } else {
                    toast.error("Error deleting selected files.");
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

.admin-panel-section {
    margin-bottom: 2rem;
}
</style>
