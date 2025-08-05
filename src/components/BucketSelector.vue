<template>
    <div>
        <label class="form-label">
            <i class="fas fa-database me-1"></i>
            S3 Bucket
        </label>
        <div ref="dropdownRef" class="dropdown" :class="{ show: isDropdownOpen }">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" @click="toggleDropdown"
                @keydown.enter="toggleDropdown" @keydown.space.prevent="toggleDropdown"
                :disabled="!selectedAccount || loading" :class="{ 'btn-outline-primary': selectedBucket }"
                :aria-expanded="isDropdownOpen" aria-haspopup="true">
                {{ selectedBucketName || 'Select Bucket' }}
            </button>
            <ul class="dropdown-menu w-100" :class="{ show: isDropdownOpen }" role="menu">
                <li v-if="buckets.length === 0" class="dropdown-item-text text-muted">
                    {{ selectedAccount ? 'No buckets available' : 'Select an account first' }}
                </li>
                <li v-for="bucket in buckets" :key="bucket.id">
                    <button type="button"
                        class="dropdown-item d-flex justify-content-between align-items-center w-100 border-0 bg-transparent text-start"
                        href="#" @click.prevent="selectBucket(bucket.id)"
                        @keydown.enter.prevent="selectBucket(bucket.id)"
                        @keydown.space.prevent="selectBucket(bucket.id)"
                        :class="{ 'active': selectedBucket === bucket.id }" role="menuitem"
                        :tabindex="isDropdownOpen ? 0 : -1">
                        <div>
                            <div class="fw-medium">{{ bucket.bucket_name }}</div>
                        </div>
                        <i v-if="selectedBucket === bucket.id" class="fas fa-check text-primary"></i>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BucketSelector',
    props: {
        selectedBucket: {
            type: String,
            default: ''
        },
        selectedAccount: {
            type: String,
            default: ''
        },
        buckets: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        selectedBucketName() {
            if (!this.buckets || this.buckets.length === 0 || !this.selectedBucket) {
                return '';
            } else {
                const bucket = this.buckets.find(b => b.id === this.selectedBucket);
                return bucket ? bucket.bucket_name : '';
            }

        }
    },
    data() {
        return {
            isDropdownOpen: false
        }
    },
    methods: {
        selectBucket(bucketId) {
            this.$emit('bucket-change', bucketId)
            this.closeDropdown()
        },
        toggleDropdown() {
            if (this.selectedAccount) {
                this.isDropdownOpen = !this.isDropdownOpen
            }
        },
        closeDropdown() {
            this.isDropdownOpen = false
        },
        handleClickOutside(event) {
            if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
                this.closeDropdown()
            }
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.closeDropdown()
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
        document.addEventListener('keydown', this.handleKeydown)
    },
    unmounted() {
        document.removeEventListener('click', this.handleClickOutside)
        document.removeEventListener('keydown', this.handleKeydown)
    }
}
</script>



<style scoped>
.dropdown-item,
.dropdown-item:focus {
    cursor: pointer;
    outline: none;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.active {
    background-color: #e7f3ff;
    color: #0d6efd;
}

.dropdown-item:focus {
    background-color: #f8f9fa;
}

.dropdown-item-text {
    padding: 0.375rem 1rem;
}

.dropdown-toggle:focus {
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>