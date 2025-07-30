<template>
    <div id="app">
        <!-- Header -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-cloud me-2"></i>
                    S3 File Manager
                </a>
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
                                <span class="badge bg-secondary ms-2">{{ currentItems.length }}</span>
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
import AccountSelector from "./components/AccountSelector.vue";
import BucketSelector from "./components/BucketSelector.vue";
import FileUpload from "./components/FileUpload.vue";
import FileList from "./components/FileList.vue";
//import SearchFilter from "./components/SearchFilter.vue";
import FolderNavigation from "./components/FolderNavigation.vue";
import axios from "axios";

export default {
    name: "App",
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
            loadingBuckets: false
        };
    },
    mounted() {
        this.loadAccounts();
    },
    methods: {
        async loadAccounts() {
            this.accounts = [{ id: "acc1", name: "Account 1", region: "us-east-1" }];
        },

        async loadBuckets() {
            // this.buckets = [
            //     { id: "bucket1", name: "uploaded-files", region: "us-east-1" },
            // ];
            try {
                this.loadingBuckets = true;
                const response = await axios.get('http://localhost:3000/api/buckets/list-buckets');
                this.buckets = response.data || [];
            } catch (error) {
                console.error("Error loading buckets:", error);
                alert("Error loading buckets.");
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
                this.loading = true;
                const id = this.selectedBucket;
                if (!searchQuery.trim()) {
                    this.loadFolderContents({ path: this.currentPath })
                } else {
                    const response = await axios.get(`http://localhost:3000/api/files/${id}/search-files`, {
                        params: {
                            folder: this.currentPath,
                            search: searchQuery
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
                console.error("Error loading folder contents:", error);
                alert("Error loading folder contents.");
            } finally {
                this.loading = false;
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
                const response = await axios.get(`http://localhost:3000/api/files/${id}/listByFolder`, {
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
                console.error('Error loading folder contents:', error)
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
                const formData = new FormData();

                // Append files (works for single or multiple)
                Array.from(uploadedFiles).forEach(file => {
                    formData.append('files', file);
                });

                const uploadPath = this.currentPath ? `${this.currentPath}/` : '';
                formData.append('key', uploadPath)
                console.log("Uploading files to path:", uploadPath);
                await axios.post(`http://localhost:3000/api/files/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            // Update progress in FileUpload component
                            this.$refs.fileUpload.updateProgress(progress);
                        }
                    }

                });

                // Reload the current folder contents after upload
                this.loadFolderContents({ path: this.currentPath });
            } catch (error) {
                console.error('Error uploading files:', error);
                alert("Error uploading files. Please try again.");
            } finally {
                this.$refs.fileUpload.isUploading = false;
                this.$refs.fileUpload.updateProgress(0);
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
                const id =this.selectedBucket;
                await axios.patch(`http://localhost:3000/api/files/${id}/rename`, {
                    oldKey: oldKey,
                    newKey: newKey,

                });
                this.loadFolderContents({ path: this.currentPath });
            } catch (error) {
                console.log("Error renaming file:", error);
                alert("Error renaming file.");
            }
        },

        async handleFileDelete(key) {
            try {
                const id = this.selectedBucket;
                const response = await axios.delete(`http://localhost:3000/api/files/${id}`, {
                    data: {
                        filePaths: [key]
                    }
                });
                if (response.status == 200) {
                    this.loadFolderContents({ path: this.currentPath });
                } else {
                    alert("Error deleting file.");
                }
            } catch (error) {
                alert("Error deleting file.");
            }
        },

        async handleBulkDelete(fileKeys) {
            try {
                const id = this.selectedBucket;
                const response = await axios.delete(`http://localhost:3000/api/files/${id}`, {
                    data: {
                        filePaths: fileKeys
                    }
                })
                if (response.status == 200) {
                    this.loadFolderContents({ path: this.currentPath });
                } else {
                    alert("Error deleting selected files.");
                }
            } catch (error) {
                alert("Error deleting selected files.");
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
#app {
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
</style>
