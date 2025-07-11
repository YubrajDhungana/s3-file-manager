<template>
    <div>
        <label class="form-label">
            <i class="fas fa-database me-1"></i>
            S3 Bucket
        </label>
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown"
                :disabled="!selectedAccount" :class="{ 'btn-outline-primary': selectedBucket }">
                {{ getSelectedBucketName() }}
            </button>
            <ul class="dropdown-menu w-100">
                <li v-if="availableBuckets.length === 0" class="dropdown-item-text text-muted">
                    {{ selectedAccount ? 'No buckets available' : 'Select an account first' }}
                </li>
                <li v-for="bucket in availableBuckets" :key="bucket.name">
                    <a class="dropdown-item d-flex justify-content-between align-items-center" href="#"
                        @click.prevent="handleBucketSelect(bucket.name)"
                        :class="{ 'active': selectedBucket === bucket.name }">
                        <div>
                            <div class="fw-medium">{{ bucket.name }}</div>
                            <small class="text-muted">{{ bucket.itemCount }} items</small>
                        </div>
                        <i v-if="selectedBucket === bucket.name" class="fas fa-check text-primary"></i>
                    </a>
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
            required: true
        },
        selectedAccount: {
            type: String,
            required: true
        }
    },
    emits: ['bucketChange'],
    data() {
        return {
            allBuckets: {
                'acc-1': [
                    { name: 'prod-images', createdDate: new Date('2023-01-15'), itemCount: 1250 },
                    { name: 'prod-documents', createdDate: new Date('2023-02-20'), itemCount: 890 },
                    { name: 'prod-backups', createdDate: new Date('2023-03-10'), itemCount: 45 }
                ],
                'acc-2': [
                    { name: 'dev-assets', createdDate: new Date('2023-04-05'), itemCount: 320 },
                    { name: 'dev-logs', createdDate: new Date('2023-04-12'), itemCount: 2100 }
                ],
                'acc-3': [
                    { name: 'test-data', createdDate: new Date('2023-05-01'), itemCount: 150 },
                    { name: 'test-reports', createdDate: new Date('2023-05-15'), itemCount: 78 }
                ]
            }
        }
    },
    computed: {
        availableBuckets() {
            return this.selectedAccount ? this.allBuckets[this.selectedAccount] || [] : []
        }
    },
    methods: {
        handleBucketSelect(bucketName) {
            this.$emit('bucketChange', bucketName)
        },
        getSelectedBucketName() {
            return this.selectedBucket || 'Select Bucket'
        }
    }

}
</script>
<style scoped>
.dropdown-item {
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.active {
    background-color: #e7f3ff;
    color: #0d6efd;
}

.dropdown-item-text {
    padding: 0.375rem 1rem;
}
</style>