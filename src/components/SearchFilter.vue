<template>
    <div>
        <label class="form-label">
            <i class="fas fa-search me-1"></i>
            Search Files
        </label>
        <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="form-control search-input" placeholder="Search by filename..."
                v-model="localQuery" />
            <button v-if="localQuery" type="button" class="btn btn-sm btn-outline-secondary position-absolute"
                style="right: 8px; top: 50%; transform: translateY(-50%);" @click="clearSearch">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div v-if="localQuery" class="mt-2">
            <small class="text-muted">
                <i class="fas fa-filter me-1"></i>
                Filtering by: "{{ localQuery }}"
            </small>
        </div>
    </div>
</template>
<script>
export default {
    name: 'SearchFilter',
    props: {
        searchQuery: {
            type: String,
            default: ''
        }
    },
    emits: ['search'],
    data() {
        return {
            localQuery: this.searchQuery
        }
    },
    watch: {
        // Watch for external changes to searchQuery
        searchQuery(newQuery) {
            this.localQuery = newQuery;
        },
        // Emit search events
        localQuery(newQuery) {
            this.$emit('search', newQuery)
        }
    },
    methods: {
        clearSearch() {
            this.localQuery = ''
        }
    }
}
</script>
<style scoped>
.search-container {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    z-index: 2;
}

.search-input {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
}
</style>