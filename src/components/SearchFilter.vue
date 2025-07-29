<template>
    <div>
        <label class="form-label">
            <i class="fas fa-search me-1"></i>
            Search Files
        </label>
        <div class="search-container">

            <i class="fas fa-search search-icon"></i>
            <input type="text" class="form-control search-input" placeholder="Search by filename..."
                v-model="inputQuery" @keyup="handleKeyup" :disabled="disabled" />
            <button type="button" class="btn btn-primary search-button" @click="performSearch" title="Search files"
                :disabled="disabled">
                <i class="fas fa-search"></i>
            </button>
            <button v-if="inputQuery" type="button" class="btn btn-sm btn-outline-secondary clear-button"
                @click="clearSearch" title="Clear search" :disabled="disabled">
                <i class="fas fa-times"></i>
            </button>


        </div>
    </div>
</template>
<script>
export default {
    name: 'SearchFilter',
    emits: ['search'],
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputQuery: ''
        }
    },
    methods: {
        performSearch() {
            this.$emit('search', this.inputQuery.trim())
        },
        handleKeyup(event) {
            if (event.key === 'Enter') {
                this.performSearch()
            }
        },
        clearSearch() {
            this.inputQuery = ''
            this.$emit('search', '')
        }
    }
}
</script>
<style scoped>
.search-container {
    position: relative;
    display: flex;
    gap: 0.5rem;
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
    flex: 1;
    padding-left: 2.5rem;
}

.search-button {
    padding: 0.375rem 0.75rem;
    white-space: nowrap;
}

.clear-button {
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.25rem 0.5rem;
    z-index: 3;
}
</style>