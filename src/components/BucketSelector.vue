<template>
    <div>
        <label class="form-label">
            <i class="fas fa-database me-1"></i>
            S3 Bucket
        </label>
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown"
                :disabled="!selectedAccount" :class="{ 'btn-outline-primary': selectedBucket }">
                {{  selectedBucketName || 'Select Account' }}
            </button>
            <ul class="dropdown-menu w-100">
                <li v-if="buckets.length === 0" class="dropdown-item-text text-muted">
                    {{ selectedAccount ? 'No buckets available' : 'Select an account first' }}
                </li>
                <li v-for="bucket in buckets" :key="bucket.name">
                    <a class="dropdown-item d-flex justify-content-between align-items-center" href="#"
                        @click.prevent="selectBucket(bucket.id)"
                        :class="{ 'active': selectedBucket === bucket.id }">
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
        },
        buckets: {
            type:Array,
            default: ()=> {}
        }
    },
    emits: ['bucketChange'], 
     computed: {
        selectedBucketName() {
          const bucket = this.buckets.find(b => b.id === this.selectedBucket);
          return bucket ? bucket.name : '';
        }
    },
    methods: {
        selectBucket(bucketId) {
            this.$emit('bucket-change', bucketId)
        },
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