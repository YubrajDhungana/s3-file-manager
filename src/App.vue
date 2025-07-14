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
                                    @bucket-change="handleBucketChange" :buckets="buckets" />
                            </div>

                            <!-- Search Filter -->
                            <div class="mb-3">
                                <SearchFilter :search-query="searchQuery" @search="handleSearch" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="col-lg-9 col-md-8">
                    <!-- File Upload Section -->
                    <div class="card card-custom mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-upload me-2"></i>
                                File Upload
                            </h5>
                            <FileUpload :disabled="!selectedAccount || !selectedBucket"
                                @file-upload="handleFileUpload" />
                        </div>
                    </div>

                    <!-- File List -->
                    <div class="card card-custom">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-folder me-2"></i>
                                Files
                                <span class="badge bg-secondary ms-2">{{ files.length }}</span>
                            </h5>
                            <FileList :files="files" :search-query="searchQuery" @file-rename="handleFileRename"
                                @file-delete="handleFileDelete" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import AccountSelector from './components/AccountSelector.vue'
import BucketSelector from './components/BucketSelector.vue'
import FileUpload from './components/FileUpload.vue'
import FileList from './components/FileList.vue'
import SearchFilter from './components/SearchFilter.vue'
import axios from "axios";

export default {
    name: 'App',
    components: {
        AccountSelector,
        BucketSelector,
        FileUpload,
        FileList,
        SearchFilter
    },
    data() {
        return {
            selectedAccount: '',
            selectedBucket: '',
            searchQuery: '',
            accounts: [],
            buckets: [],
            files: []
        }
    },
    mounted() {
        this.loadAccounts();
    },
    methods: {
        async loadAccounts() {
            const res = await axios.get('http://localhost:3001/accounts');
            if (res.data.length > 0) {
                this.accounts = res.data;
            } else {
                alert("Error loading accounts");
            }
        },

        async loadBuckets(accountId) {
            if (!accountId) return;
            try {
                const res = await axios.get(`http://localhost:3001/buckets?accountId=${accountId}`);
                if (res.data.length > 0) {
                    this.buckets = res.data;
                }
            } catch (error) {
                console.error("Error loading buckets:", error);
                alert("Error loading buckets for the selected account.");
            }
        },
        async loadFiles(bucketId, accountId) {
            if (!bucketId || !accountId) return;
            try {
                const res = await axios.get(`http://localhost:3001/files?bucketId=${bucketId}&accountId=${accountId}`);
                if (res.data.length > 0) {
                    this.files = res.data;
                }
            } catch (error) {
                alert("Error loading files for the selected bucket.");
            }
        },
        handleAccountChange(accountId) {
            this.selectedAccount = accountId
            this.selectedBucket = '' // Reset bucket when account changes
            this.buckets = [];

            if (accountId) {
                this.loadBuckets(accountId);
            }
        },

        handleBucketChange(bucketid) {
            this.selectedBucket = bucketid

            if (bucketid && this.selectedAccount) {
                this.loadFiles(bucketid, this.selectedAccount);
            }
        },

        async handleFileUpload(uploadedFiles) {
            if (!this.selectedAccount || !this.selectedBucket) return;
            for (const file of Array.from(uploadedFiles)) {
                try {
                    const fileData = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        size: file.size,
                        lastModified: new Date().toISOString(),
                        type: this.getFileType(file),
                        bucketId: this.selectedBucket,
                        accountId: this.selectedAccount
                    }
                    console.log("Uploading file:", fileData);
                    await axios.post('http://localhost:3001/files', fileData, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                } catch (error) {
                    alert("Error uploading file.");
                }
            }
            // Reload files after upload
            await this.loadFiles(this.selectedBucket, this.selectedAccount);
        },
        // Add this helper method
        getFileType(file) {
            const mimeType = file.type;
            const extension = file.name.split('.').pop()?.toLowerCase();

            // Handle by MIME type first
            if (mimeType.startsWith('image/')) return 'image';
            if (mimeType.startsWith('video/')) return 'video';
            if (mimeType.startsWith('audio/')) return 'audio';

            // Handle specific types
            if (mimeType === 'application/pdf') return 'pdf';
            if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
            if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
            if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';

            // Fallback to extension
            if (extension) {
                switch (extension) {
                    case 'pdf': return 'pdf';
                    case 'csv': return 'csv';
                    case 'zip': case 'rar': case '7z': return 'archive';
                    case 'js': case 'ts': case 'html': case 'css': case 'json': return 'code';
                    default: return extension;
                }
            }

            return 'unknown';
        },

        handleFileRename(fileId, newName) {
            const fileIndex = this.files.findIndex(f => f.id === fileId)
            if (fileIndex !== -1) {
                this.files[fileIndex].name = newName
            }
        },

        handleFileDelete(fileId) {
            this.files = this.files.filter(f => f.id !== fileId)
        },

        handleSearch(query) {
            this.searchQuery = query
        }
    }
}
</script>

<style scoped>
#app {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.navbar-brand {
    font-weight: 600;
}

.card-custom {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border-radius: 0.5rem;
}

.card-title {
    color: #495057;
    font-weight: 600;
}

.badge {
    font-size: 0.75rem;
}
</style>