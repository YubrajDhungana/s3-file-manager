<template>
    <div class="item-manager-container">
        <!-- Status Info -->
        <div class="status-info mb-3">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <div class="d-flex align-items-center gap-3">
                        <div class="badge bg-light text-dark">
                            <i class="fas fa-folder me-1"></i>
                            {{filteredItems.filter(item => item.isFolder).length}} folders
                        </div>
                        <div class="badge bg-light text-dark">
                            <i class="fas fa-file me-1"></i>
                            {{filteredItems.filter(item => !item.isFolder).length}} files
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-md-end mt-2 mt-md-0">
                    <small class="text-muted">
                        Showing {{ startItem }}-{{ endItem }} of {{ filteredItems.length }} items
                    </small>
                </div>
            </div>
        </div>

        <!-- Table Container with Fixed Header -->
        <div class="table-container">
            <div v-if="items.length === 0" class="empty-state">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">
                    {{ searchQuery ? 'No items match your search' : 'No data found' }}
                </h6>
                <p v-if="searchQuery" class="text-muted">
                    Try adjusting your search terms
                </p>
                <p v-else class="text-muted">
                    Upload files to get started
                </p>
            </div>

            <div v-else class="table-wrapper">
                <!-- Fixed Header -->
                <div class="table-header-fixed">
                    <table class="table table-header mb-0">
                        <thead>
                            <tr>
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
                                :class="{ 'folder-row': item.isFolder }">
                                <td style="width: 40%;" class="align-middle">
                                    <div class="d-flex align-items-center">
                                        <i :class="getItemIcon(item.type, item.isFolder)" class="item-icon"></i>
                                        <div v-if="editingFile === item.key" class="flex-grow-1">
                                            <input v-model="editingName" type="text"
                                                class="form-control form-control-sm" @keyup.enter="saveRename(item.key)"
                                                @keyup.escape="cancelRename" @blur="saveRename(item.key)" />
                                        </div>
                                        <div v-else class="flex-grow-1">
                                            <span class="item-name" :class="{ 'folder-name': item.isFolder }">
                                                {{ item.name }}
                                            </span>
                                            <small v-if="item.isFolder" class="text-muted d-block">
                                                Double-click to open
                                            </small>
                                        </div>
                                    </div>
                                </td>
                                <td style="width: 20%;" class="align-middle">
                                    <span class="badge"
                                        :class="item.isFolder ? 'bg-warning text-dark' : 'bg-light text-dark'">
                                        {{ item.isFolder ? 'Folder' : item.type.toUpperCase() }}
                                    </span>
                                </td>
                                <td style="width: 15%;" class="align-middle text-muted">
                                    {{ formatFileSize(item.size) }}
                                </td>
                                <td style="width: 20%;" class="align-middle text-muted">
                                    {{ formatDate(item.lastModified) }}
                                </td>
                                <td style="width: 15%;" class="align-middle text-center">
                                    <div class="action-buttons">
                                        <button v-if="editingFile !== item.id" type="button"
                                            class="btn btn-sm btn-outline-primary" @click="startRename(item)"
                                            :title="`Rename ${item.isFolder ? 'folder' : 'file'}`">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button v-if="editingFile !== item.id" type="button"
                                            class="btn btn-sm btn-outline-danger"
                                            @click="deleteItem(item.id, item.isFolder)"
                                            :title="`Delete ${item.isFolder ? 'folder' : 'file'}`">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <div v-if="editingFile === item.id" class="d-flex gap-1">
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
        <div v-if="filteredItems.length > 0" class="pagination-controls mt-3">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center gap-2">
                            <label class="form-label mb-0 text-nowrap">Rows per page:</label>
                            <select v-model="itemsPerPage" @change="changeItemsPerPage(itemsPerPage)"
                                class="form-select form-select-sm" style="width: auto;">
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="50">50</option>
                            </select>
                        </div>
                        <small class="text-muted">
                            Page {{ currentPage }} of {{ totalPages }}
                        </small>
                    </div>
                </div>
                <div class="col-md-6">
                    <nav class="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="goToPage(currentPage - 1)"
                                    :disabled="currentPage === 1">
                                    <i class="fas fa-chevron-left"></i>
                                    Previous
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="goToPage(currentPage + 1)"
                                    :disabled="currentPage === totalPages">
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
        }
    },
    emits: ['fileRename', 'fileDelete', 'folderDoubleClick'],
    data() {
        return {
            editingFile: null,
            editingName: '',
            currentPage: 1,
            itemsPerPage: 10
        }
    },
    computed: {
        // Filter items based on search query
        filteredItems() {
            let filtered = this.items

            // Apply search filter
            if (this.searchQuery) {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                )
            }

            return filtered
        },
        // Pagination calculations
        totalPages() {
            return Math.ceil(this.filteredItems.length / this.itemsPerPage)
        },
        paginatedItems() {
            const start = (this.currentPage - 1) * this.itemsPerPage
            const end = start + this.itemsPerPage
            return this.filteredItems.slice(start, end)
        },
        startItem() {
            return this.filteredItems.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1
        },
        endItem() {
            return Math.min(this.currentPage * this.itemsPerPage, this.filteredItems.length)
        }
    },
    watch: {
        searchQuery() {
            this.resetToFirstPage()
        }
    },
    methods: {
        // Watch for filter changes and reset to first page
        resetToFirstPage() {
            this.currentPage = 1
        },
        // Pagination methods
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page
            }
        },
        changeItemsPerPage(newSize) {
            this.itemsPerPage = newSize
            this.currentPage = 1
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
            }).format(date)
        },
        getItemIcon(type, isFolder) {
            if (isFolder) {
                return 'fas fa-folder text-warning'
            }

            const iconMap = {
                'pdf': 'fas fa-file-pdf text-danger',
                'image': 'fas fa-file-image text-success',
                'video': 'fas fa-file-video text-info',
                'audio': 'fas fa-file-audio text-warning',
                'csv': 'fas fa-file-csv text-success',
                'excel': 'fas fa-file-excel text-success',
                'word': 'fas fa-file-word text-primary',
                'powerpoint': 'fas fa-file-powerpoint text-warning',
                'archive': 'fas fa-file-archive text-secondary',
                'code': 'fas fa-file-code text-info',
                'text': 'fas fa-file-alt text-info'
            }

            return iconMap[type] || 'fas fa-file text-muted'
        },
        startRename(item) {
            this.editingFile = item.id
            this.editingName = item.name
        },
        cancelRename() {
            this.editingFile = null
            this.editingName = ''
        },
        saveRename(itemId) {
            if (this.editingName.trim()) {
                this.$emit('fileRename', itemId, this.editingName.trim())
            }
            this.editingFile = null
            this.editingName = ''
        },
        deleteItem(itemId, isFolder) {
            const itemType = isFolder ? 'folder' : 'file'
            if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
                this.$emit('fileDelete', itemId)
            }
        },
        handleItemDoubleClick(item) {
            if (item.isFolder) {
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