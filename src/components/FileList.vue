<template>
    <div class="item-manager-container">
        <!-- Bulk Actions Bar -->
        <div v-if="selectedItems.length > 0" class="bulk-actions-bar mb-3 p-3 bg-light rounded">
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <span class="text-muted">
                        {{ selectedItems.length }} item(s) selected
                    </span>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger" @click="confirmBulkDelete">
                        <i class="fas fa-trash me-1"></i>
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>
        <!-- Table Container with Fixed Header -->
        <div class="table-container">
            <div v-if="loading" class="empty-state">
                <i class="fas fa-spinner fa-spin fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">Loading files...</h6>
            </div>

            <div v-else-if="items.length === 0" class="empty-state">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">No files found</h6>
            </div>

            <div v-else-if="items.length > 0" class="table-wrapper">
                <!-- Fixed Header -->
                <div class="table-header-fixed">
                    <table class="table table-header mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style="width: 5%;">
                                    <input type="checkbox" :checked="allItemsSelected" @change="toggleSelectAll">
                                </th>
                                <th scope="col" style="width: 40%;">
                                    <i class="fas fa-file me-2"></i>
                                    Name
                                </th>
                                <th scope="col" style="width: 20%;">
                                    <i class="fas fa-tag me-2"></i>
                                    Type
                                </th>
                                <th scope="col" style="width: 15%;">
                                    <i class="fas fa-weight me-2"></i>
                                    Size
                                </th>
                                <th scope="col" style="width: 20%;">
                                    <i class="fas fa-calendar me-2"></i>
                                    Last Modified
                                </th>
                                <th scope="col" style="width: 15%;" class="text-center">
                                    <i class="fas fa-cogs me-2"></i>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <!-- Scrollable Body -->
                <div class="table-body-scrollable">
                    <table class="table table-hover mb-0">
                        <tbody>
                            <tr v-for="item in items" :key="item.key" @dblclick="handleItemDoubleClick(item)"
                                :class="{ 'folder-row': item.type === 'folder', 'selected-row': isItemSelected(item) }">
                                <td style="width: 5%;" class="align-middle">
                                    <input type="checkbox" v-model="selectedItems" :value="item.key"
                                        :disabled="item.type === 'folder'">
                                </td>
                                <td style="width: 40%;" class="align-middle">
                                    <div class="d-flex align-items-center">
                                        <i :class="getItemIcon(item.type, item.type === 'folder', item.name)"
                                            class="item-icon"></i>
                                        <div v-if="editingFile === item.key" class="flex-grow-1">
                                            <input v-model="editingName" type="text"
                                                class="form-control form-control-sm" @keyup.enter="saveRename(item.key)"
                                                @keyup.escape="cancelRename" @blur="saveRename(item.key)" />
                                        </div>
                                        <div v-else class="flex-grow-1">
                                            <!-- File: Show as clickable link -->
                                            <a v-if="item.type === 'file'" :href="item.url" target="_blank"
                                                rel="noopener noreferrer"
                                                class="item-name file-link text-decoration-none"
                                                :title="'Open ' + item.name">
                                                {{ item.name }}
                                            </a>
                                            <span v-else class="item-name"
                                                :class="{ 'folder-name': item.type === 'folder' }">
                                                {{ item.name }}
                                            </span>
                                            <small v-if="item.type === 'folder'" class="text-muted d-block">
                                                Double-click to open
                                            </small>
                                        </div>
                                    </div>
                                </td>
                                <td style="width: 20%;" class="align-middle">

                                    <span class="badge"
                                        :class="item.type === 'folder' ? 'bg-warning text-dark' : 'bg-light text-dark'">
                                        {{ item.type === 'folder' ? 'Folder' :
                                            (getFileExtension(item.name)).toUpperCase() || 'FILE' }}
                                    </span>
                                </td>
                                <td style="width: 15%;" class="align-middle text-muted">
                                    <span v-if="item.size">
                                        {{ formatFileSize(item.size) }}
                                    </span>
                                    <span v-else>-</span>

                                </td>
                                <td style="width: 20%;" class="align-middle text-muted">
                                    <!-- {{ formatDate(item.lastModified) }} -->
                                    <span v-if="item.lastModified">
                                        {{ new Date(item.lastModified).toLocaleString() }}
                                    </span>
                                    <span v-else>-</span>
                                </td>
                                <td style="width: 15%;" class="align-middle text-center">
                                    <div v-if="item.type === 'folder'" class="text-muted">-</div>
                                    <div v-else class="action-buttons">
                                        <button v-if="editingFile !== item.key" type="button"
                                            class="btn btn-sm btn-outline-primary" @click="startRename(item)"
                                            :title="`Rename ${item.type === 'folder' ? 'folder' : 'file'}`">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button v-if="editingFile !== item.key" type="button"
                                            class="btn btn-sm btn-outline-danger" @click="deleteItem(item.key)"
                                            :title="`Delete ${item.type === 'folder' ? 'folder' : 'file'}`">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <div v-if="editingFile === item.key" class="d-flex gap-1">
                                            <button type="button" class="btn btn-sm btn-success"
                                                @click="saveRename(item.id)" title="Save changes">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-secondary" @click="cancelRename"
                                                title="Cancel">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="items.length > 0" class="pagination-controls mt-3">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center gap-2">
                            <label class="form-label mb-0 text-nowrap">Rows per page:</label>
                            <select v-model="itemsPerPage" @change="changeItemsPerPage"
                                class="form-select form-select-sm" style="width: auto;">
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="50">50</option>
                            </select>
                        </div>
                        <!-- <small class="text-muted">
                            Page {{ currentPage }} of {{ totalPages }}
                        </small> -->
                    </div>
                </div>
                <div class="col-md-6">
                    <nav class="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: !hasPreviousPage || loading }">
                                <button class="page-link" @click="goToPreviousPage"
                                    :disabled="!hasPreviousPage || loading">
                                    <i class="fas fa-chevron-left"></i>
                                    Previous
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: !isTruncated || loading }">
                                <button class="page-link" @click="gotoNextPage" :disabled="!isTruncated || loading">
                                    Next
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FileList',
    props: {
        items: {
            type: Array,
            required: true,
            default: () => []
        },
        searchQuery: {
            type: String,
            default: ''
        },
        currentPath: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false
        },
        isTruncated: {
            type: Boolean,
            default: false
        },

    },
    emits: ['fileRename', 'fileDelete', 'folderDoubleClick', 'bulkDelete'],
    data() {
        return {
            selectedItems: [],
            editingFile: null,
            editingName: '',
            newKey: null,
            currentPage: 1,
            itemsPerPage: 10,
            //storing pagination token for navigation
            paginationTokens: [""],//first page always starts with null
            currentTokenIndex: 0
        }
    },
    computed: {
        hasPreviousPage() {
            return this.currentTokenIndex > 0;
        },
        allItemsSelected() {
            // Only consider files (not folders) for select all
            const selectableItems = this.items.filter(item => item.type !== 'folder');
            return selectableItems.length > 0 &&
                this.selectedItems.length === selectableItems.length;
        },
    },

    methods: {
        isItemSelected(item) {
            return this.selectedItems.includes(item.key);
        },
        toggleSelectAll(event) {
            if (event.target.checked) {
                // Select all files (excluding folders)
                this.selectedItems = this.items
                    .filter(item => item.type !== 'folder')
                    .map(item => item.key);
            } else {
                this.selectedItems = [];
            }
        },
        //pagination method
        gotoNextPage() {
            if (this.isTruncated && !this.loading) {
                this.currentTokenIndex++;
                // The next continuation token will be provided by parent component
                this.$emit('loadData', {
                    limit: this.itemsPerPage,
                    continuationToken: this.paginationTokens[this.currentTokenIndex],
                    path: this.currentPath
                })
            }
        },
        goToPreviousPage() {
            if (this.hasPreviousPage && !this.loading) {
                this.currentTokenIndex--;
                this.$emit('loadData', {
                    limit: this.itemsPerPage,
                    continuationToken: this.paginationTokens[this.currentTokenIndex],
                    path: this.currentPath
                })

            }
        },

        changeItemsPerPage() {
            this.currentTokenIndex = 0;
            this.paginationTokens = [""];
            this.$emit('loadData', {
                limit: this.itemsPerPage,
                continuationToken: '',
                path: this.currentPath
            })
        },

        // Method to update pagination tokens from parent
        updatePaginationToken(nextToken) {
            // Only add new token if we don't already have it
            if (nextToken && this.paginationTokens.length === this.currentTokenIndex + 1) {
                this.paginationTokens.push(nextToken)
            }
        },

        //get file extension
        getFileExtension(fileName) {
            if (!fileName) return '';
            const lastDotIndex = fileName.lastIndexOf('.');
            if (lastDotIndex === -1 || lastDotIndex === 0) return '';
            return fileName.slice(lastDotIndex + 1).toLowerCase();
        },
        // Item operations
        formatFileSize(bytes) {
            if (bytes === 0) return '-' // For folders

            const k = 1024
            const sizes = ['Bytes', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date))
        },
        getItemIcon(type, isFolder, fileName = '') {
            if (isFolder) {
                return 'fas fa-folder text-warning'
            }
            const extension = this.getFileExtension(fileName);
            const iconMap = {
                // Documents
                'pdf': 'fas fa-file-pdf text-danger',
                'doc': 'fas fa-file-word text-primary',
                'docx': 'fas fa-file-word text-primary',
                'xls': 'fas fa-file-excel text-success',
                'xlsx': 'fas fa-file-excel text-success',
                'ppt': 'fas fa-file-powerpoint text-warning',
                'pptx': 'fas fa-file-powerpoint text-warning',

                // Images
                'jpg': 'fas fa-file-image text-success',
                'jpeg': 'fas fa-file-image text-success',
                'png': 'fas fa-file-image text-success',
                'gif': 'fas fa-file-image text-success',
                'svg': 'fas fa-file-image text-success',
                'webp': 'fas fa-file-image text-success',

                // Videos
                'mp4': 'fas fa-file-video text-info',
                'avi': 'fas fa-file-video text-info',
                'mov': 'fas fa-file-video text-info',
                'wmv': 'fas fa-file-video text-info',
                'webm': 'fas fa-file-video text-info',

                // Audio
                'mp3': 'fas fa-file-audio text-warning',
                'wav': 'fas fa-file-audio text-warning',
                'flac': 'fas fa-file-audio text-warning',
                'aac': 'fas fa-file-audio text-warning',

                // Code files
                'js': 'fas fa-file-code text-info',
                'ts': 'fas fa-file-code text-info',
                'html': 'fas fa-file-code text-info',
                'css': 'fas fa-file-code text-info',
                'vue': 'fas fa-file-code text-info',
                'py': 'fas fa-file-code text-info',
                'java': 'fas fa-file-code text-info',
                'cpp': 'fas fa-file-code text-info',
                'php': 'fas fa-file-code text-info',

                // Text files
                'txt': 'fas fa-file-alt text-info',
                'md': 'fas fa-file-alt text-info',
                'json': 'fas fa-file-alt text-info',
                'xml': 'fas fa-file-alt text-info',
                'csv': 'fas fa-file-csv text-success',

                // Archives
                'zip': 'fas fa-file-archive text-secondary',
                'rar': 'fas fa-file-archive text-secondary',
                '7z': 'fas fa-file-archive text-secondary',
                'tar': 'fas fa-file-archive text-secondary',
                'gz': 'fas fa-file-archive text-secondary'
            }

            return iconMap[extension] || 'fas fa-file text-muted'
        },
        startRename(item) {
            this.editingFile = item.key
            this.editingName = item.name
        },
        cancelRename() {
            this.editingFile = null
            this.editingName = ''
        },
        saveRename(oldKey) {
            if (this.editingName.trim()) {
                this.newKey = this.currentPath + '/' + this.editingName.trim()
                console.log('Renaming item:', oldKey, 'to', this.newKey)
                this.$emit('fileRename', oldKey, this.newKey)
            }
            this.editingFile = null
            this.editingName = ''
        },
        deleteItem(key) {
            if (confirm(`Are you sure you want to delete this file?`)) {
                this.$emit('fileDelete', key)
            }
        },
        handleItemDoubleClick(item) {
            if (item.type === 'folder') {
                this.$emit('folderDoubleClick', item.name)
            }
            // For files, you could implement file preview/download here
        }
    }
}
</script>



<style scoped>
.item-manager-container {
    height: 100%;
}

.status-info {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.table-container {
    background-color: #ffffff;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    overflow: hidden;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.table-wrapper {
    position: relative;
}

.table-header-fixed {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #ffffff;
    border-bottom: 2px solid #dee2e6;
}

.table-header thead th {
    background-color: #f8f9fa;
    border-bottom: none;
    font-weight: 600;
    color: #495057;
    padding: 1rem;
    white-space: nowrap;
}

.table-body-scrollable {
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
}

.table-body-scrollable .table {
    margin-bottom: 0;
}

.table-body-scrollable tbody tr:hover {
    background-color: #f8f9fa;
}

.folder-row {
    cursor: pointer;
}

.folder-row:hover {
    background-color: #fff3cd !important;
}

.table-body-scrollable td {
    padding: 1rem;
    vertical-align: middle;
    border-top: 1px solid #dee2e6;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.item-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex-shrink: 0;
}

.item-name {
    font-weight: 500;
}

.folder-name {
    color: #856404;
    font-weight: 600;
}

.pagination-controls {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.page-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.badge {
    font-size: 0.75rem;
}

/* Custom scrollbar for webkit browsers */
.table-body-scrollable::-webkit-scrollbar {
    width: 8px;
}

.table-body-scrollable::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.table-body-scrollable::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.table-body-scrollable::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }

    .item-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }

    .table-body-scrollable {
        max-height: 300px;
    }

    .pagination-controls .row>div {
        text-align: center;
    }

    .pagination-controls .d-flex {
        justify-content: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
}
</style>