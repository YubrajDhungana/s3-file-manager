<template>
    <div>
        <div class="drag-drop-area" :class="{
            'drag-over': isDragOver,
            'disabled': disabled
        }" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="triggerFileInput">
            <div v-if="!disabled">
                <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                <h5 class="mb-2">Drag & Drop Files Here</h5>
                <p class="text-muted mb-3">or click to browse files</p>
                <button type="button" class="btn btn-primary">
                    <i class="fas fa-folder-open me-2"></i>
                    Browse Files
                </button>
            </div>
            <div v-else class="text-muted">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h6>Please select an account and bucket first</h6>
            </div>
        </div>

        <input ref="fileInput" type="file" class="d-none" multiple @change="handleFileSelect" />

        <!-- Upload Progress -->
        <div v-if="isUploading" class="upload-progress">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Uploading files...</span>
                <span class="text-muted">{{ uploadProgress }}%</span>
            </div>
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                    :style="{ width: uploadProgress + '%' }" :aria-valuenow="uploadProgress" aria-valuemin="0"
                    aria-valuemax="100"></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FileUpload',
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ['fileUpload'],
    data() {
        return {
            isDragOver: false,
            isUploading: false,
            uploadProgress: 0
        }
    },
    methods: {
        handleDragOver(e) {
            e.preventDefault()
            if (!this.disabled) {
                this.isDragOver = true
            }
        },
        handleDragLeave(e) {
            e.preventDefault()
            this.isDragOver = false
        },

        handleDrop(e) {
            e.preventDefault()
            this.isDragOver = false

            if (this.disabled) return

            const files = e.dataTransfer?.files
            if (files && files.length > 0) {
                this.uploadFiles(files)
            }
        },
        handleFileSelect(e) {
            const target = e.target
            if (target.files && target.files.length > 0) {
                this.uploadFiles(target.files)
            }
        },
        async uploadFiles(files) {
            this.isUploading = true
            this.uploadProgress = 0

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                this.uploadProgress += 10
                if (this.uploadProgress >= 100) {
                    clearInterval(progressInterval)
                    this.isUploading = false
                    this.uploadProgress = 0
                    this.$emit('fileUpload', files)
                }
            }, 200)
        },
        triggerFileInput() {
            if (!this.disabled) {
                this.$refs.fileInput?.click()
            }
        }
    }
}
</script>
<style scoped>
.drag-drop-area {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 3rem;
    text-align: center;
    background-color: #ffffff;
    transition: all 0.3s ease;
    cursor: pointer;
}

.drag-drop-area:hover:not(.disabled) {
    border-color: #0d6efd;
    background-color: #f8f9ff;
}

.drag-drop-area.drag-over {
    border-color: #0d6efd;
    background-color: #e7f3ff;
}

.drag-drop-area.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: #f8f9fa;
}

.upload-progress {
    margin-top: 1rem;
}

.progress {
    height: 8px;
}
</style>