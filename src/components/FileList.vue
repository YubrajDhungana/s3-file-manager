<template>
    <div class="file-table">
        <div v-if="filteredFiles.length === 0" class="text-center py-5">
            <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">
                {{ searchQuery ? 'No files match your search' : 'No files uploaded yet' }}
            </h6>
            <p v-if="searchQuery" class="text-muted">
                Try adjusting your search terms
            </p>
        </div>

        <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-header">
                    <tr>
                        <th scope="col" class="border-0">
                            <i class="fas fa-file me-2"></i>
                            Name
                        </th>
                        <th scope="col" class="border-0">
                            <i class="fas fa-weight me-2"></i>
                            Size
                        </th>
                        <th scope="col" class="border-0">
                            <i class="fas fa-calendar me-2"></i>
                            Last Modified
                        </th>
                        <th scope="col" class="border-0 text-center">
                            <i class="fas fa-cogs me-2"></i>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in filteredFiles" :key="file.id">
                        <td class="align-middle">
                            <div class="d-flex align-items-center">
                                <!-- <i :class="getFileIcon(file.type)" class="file-icon"></i> -->
                                <div v-if="editingFile === file.id" class="flex-grow-1">
                                    <input v-model="editingName" type="text" class="form-control form-control-sm"
                                        @keyup.enter="saveRename(file.id)" @keyup.escape="cancelRename"
                                        @blur="saveRename(file.id)" ref="editInput" />
                                </div>
                                <span v-else class="flex-grow-1">{{ file.key }}</span>
                            </div>
                        </td>
                        <td class="align-middle text-muted">
                            {{ formatFileSize(file.size) }}
                        </td>
                        <td class="align-middle text-muted">
                            {{ formatDate(file.lastModified) }}
                        </td>
                        <td class="align-middle text-center">
                            <div class="action-buttons">
                                <button v-if="editingFile !== file.id" type="button"
                                    class="btn btn-sm btn-outline-primary" @click="startRename(file)"
                                    title="Rename file">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button v-if="editingFile !== file.id" type="button"
                                    class="btn btn-sm btn-outline-danger" @click="deleteFile(file.id)"
                                    title="Delete file">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <div v-if="editingFile === file.id" class="d-flex gap-1">
                                    <button type="button" class="btn btn-sm btn-success" @click="saveRename(file.id)"
                                        title="Save changes">
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
</template>
<script>
export default {
    name: 'FileList',
    props: {
        files: {
            type: Array,
            required: true,
            default: () => []
        },
        searchQuery: {
            type: String,
            required: true,
            default: ''
        }
    },
    emits: ['fileRename', 'fileDelete'],
    data() {
        return {
            editingFile: null,
            editingName: ''
        }
    },
    computed: {
        filteredFiles() {
            if (!this.searchQuery) return this.files;

            return this.files.filter(file =>
                file.key.toLowerCase().includes(this.searchQuery.toLowerCase())
            )

        }
    },

    methods: {
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes'

            const k = 1024
            const sizes = ['Bytes', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        },
        formatDate(date) {
            // return new Intl.DateTimeFormat('en-US', {
            //     year: 'numeric',
            //     month: 'short',
            //     day: 'numeric',
            //     hour: '2-digit',
            //     minute: '2-digit'
            // }).format(date)

            // Handle different date formats
            let dateObj;

            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === 'string') {
                dateObj = new Date(date);
            } else {
                return 'Invalid Date';
            }

            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(dateObj);
        },
        // getFileIcon(type) {
        //     const iconMap = {
        //         'pdf': 'fas fa-file-pdf text-danger',
        //         'image': 'fas fa-file-image text-success',
        //         'video': 'fas fa-file-video text-info',
        //         'audio': 'fas fa-file-audio text-warning',
        //         'csv': 'fas fa-file-csv text-success',
        //         'excel': 'fas fa-file-excel text-success',
        //         'word': 'fas fa-file-word text-primary',
        //         'powerpoint': 'fas fa-file-powerpoint text-warning',
        //         'archive': 'fas fa-file-archive text-secondary',
        //         'code': 'fas fa-file-code text-info'
        //     }
        //     return iconMap[type] || 'fas fa-file text-muted'
        // },
        startRename(file) {
            this.editingFile = file.id
            this.editingName = file.name
        },
        cancelRename() {
            this.editingFile = null
            this.editingName = ''
        },
        saveRename(fileId) {
            if (this.editingName.trim()) {
                this.$emit('fileRename', fileId, this.editingName.trim())
            }
            this.editingFile = null
            this.editingName = ''
        },
        deleteFile(fileId) {
            if (confirm('Are you sure you want to delete this file?')) {
                this.$emit('fileDelete', fileId)
            }
        }
    }
}
</script>
<style scoped>
.file-table {
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
}

.table-header {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.table-header th {
    font-weight: 600;
    color: #495057;
    padding: 1rem;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.file-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }

    .table-responsive {
        font-size: 0.875rem;
    }

    .file-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }
}
</style>