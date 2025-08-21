<template>
    <div class="folder-navigation">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="mb-0">
                <i class="fas fa-sitemap me-2"></i>
                Navigation
            </h6>
            <!-- <small class="text-muted">{{ selectedBucket }}</small> -->
        </div>

        <!-- Breadcrumb Navigation -->
        <nav aria-label="folder-breadcrumb">
            <ol class="breadcrumb mb-0">
                <li v-for="(item, index) in breadcrumbItems" :key="item.path" class="breadcrumb-item"
                    :class="{ active: index === breadcrumbItems.length - 1 }">
                    <button v-if="index < breadcrumbItems.length - 1" type="button"
                        class="btn btn-link p-0 text-decoration-none breadcrumb-btn" @click="navigateToPath(item.path)">
                        <i v-if="item.name === 'Root'" class="fas fa-home me-1"></i>
                        {{ item.name }}
                    </button>
                    <span v-else class="current-folder">
                        <i v-if="item.name === 'Root'" class="fas fa-home me-1"></i>
                        {{ item.name }}
                    </span>
                </li>
            </ol>
        </nav>

        <!-- Current Path Display -->
        <div class="mt-2">
            <small class="text-muted">
                <i class="fas fa-map-marker-alt me-1"></i>
                Current Path: <code>{{ currentPath || '/' }}</code>
            </small>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FolderNavigation',
    props: {
        currentPath: {
            type: String,
            required: true,
            default: ''
        },
        selectedBucket: {
            type: String,
            required: true,
            default: ''
        }
    },
    emits: ['pathChange'],
    computed: {
        // Generate breadcrumb items from current path
        breadcrumbItems() {
            if (!this.currentPath) {
                return [{ name: 'Root', path: '' }]
            }
            const items = [{ name: 'Root', path: '' }]

            // Special handling for paths starting with the "/" folder
            if (this.currentPath.startsWith('/')) {
                // Add the "/" folder as the first item after Root
                items.push({ name: '/', path: '/' })

                // Process remaining path parts if any
                const remainingPath = this.currentPath.substring(1)
                if (remainingPath) {
                    let currentPath = '/'
                    const parts = remainingPath.split('/').filter(p => p)

                    parts.forEach(part => {
                        currentPath = `${currentPath}${part}/`
                        items.push({
                            name: part,
                            path: currentPath
                        })
                    })
                }
            } else {
                // Normal path processing for non-root paths
                let currentPath = ''
                this.currentPath.split('/').filter(p => p).forEach(part => {
                    currentPath = currentPath ? `${currentPath}/${part}` : part
                    items.push({
                        name: part,
                        path: currentPath
                    })
                })
            }

            return items
        }
    },
    methods: {
        navigateToPath(path) {
            console.log("path clicked", path)
            this.$emit('pathChange', path)
        }
    }
}
</script>

<style scoped>
.folder-navigation {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.breadcrumb {
    background-color: transparent;
    padding: 0;
    margin: 0;
}

.breadcrumb-item {
    font-size: 0.9rem;
}

.breadcrumb-btn {
    color: #0d6efd !important;
    font-size: inherit;
    line-height: inherit;
}

.breadcrumb-btn:hover {
    color: #0a58ca !important;
    text-decoration: underline !important;
}

.current-folder {
    color: #6c757d;
    font-weight: 500;
}

.breadcrumb-item+.breadcrumb-item::before {
    content: ">";
    color: #6c757d;
}

code {
    background-color: #e9ecef;
    color: #495057;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
}
</style>