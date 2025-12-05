<template>
    <div class="container mx-auto px-4 py-8">
        <div v-if="pending" class="flex justify-center items-center min-h-[400px]">
            <ProgressSpinner />
        </div>

        <div v-else-if="error" class="text-center py-8">
            <Message severity="error">載入賽事失敗</Message>
            <Button label="返回列表" icon="pi pi-arrow-left" class="mt-4" @click="$router.push('/events')" />
        </div>

        <div v-else-if="event">
            <!-- Back button -->
            <Button label="返回列表" icon="pi pi-arrow-left" variant="text" class="mb-4" @click="$router.back()" />

            <!-- Cover image -->
            <div v-if="event.coverImage" class="mb-6 rounded-lg overflow-hidden">
                <img :src="event.coverImage" :alt="event.name" class="w-full h-64 object-cover" />
            </div>

            <!-- Event header -->
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h1 class="text-4xl font-bold mb-2">{{ event.name }}</h1>
                    <div class="flex gap-4 text-gray-600">
                        <span class="flex items-center gap-2">
                            <i class="pi pi-calendar"></i>
                            {{ formatDate(event.date) }}
                        </span>
                        <span class="flex items-center gap-2">
                            <i class="pi pi-map-marker"></i>
                            {{ event.location }}
                        </span>
                    </div>
                </div>

                <!-- Edit/Delete buttons (only for organizer) -->
                <div v-if="isOrganizer" class="flex gap-2">
                    <Button label="編輯" icon="pi pi-pencil" severity="secondary" @click="handleEdit" />
                    <Button
                        label="刪除"
                        icon="pi pi-trash"
                        severity="danger"
                        variant="outlined"
                        @click="handleDelete"
                    />
                </div>
            </div>

            <!-- Event details card -->
            <Card class="mb-6">
                <template #content>
                    <div class="space-y-4">
                        <div v-if="event.sportType">
                            <h3 class="font-semibold text-lg mb-2">運動類型</h3>
                            <Tag :value="getSportTypeLabel(event.sportType)" severity="info" />
                        </div>

                        <div v-if="event.description">
                            <h3 class="font-semibold text-lg mb-2">賽事描述</h3>
                            <p class="text-gray-700 whitespace-pre-line">{{ event.description }}</p>
                        </div>

                        <div>
                            <h3 class="font-semibold text-lg mb-2">狀態</h3>
                            <Tag :value="getStatusLabel(event.status)" :severity="getStatusSeverity(event.status)" />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Albums section (placeholder for future) -->
            <Card>
                <template #title>
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold">相簿列表</h2>
                        <Button v-if="isPhotographer" label="上傳相簿" icon="pi pi-plus" disabled />
                    </div>
                </template>
                <template #content>
                    <p class="text-gray-500 text-center py-8">相簿功能即將推出...</p>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/useAuthStore';

const route = useRoute();
const router = useRouter();
const { getEventById, deleteEvent } = useEvents();
const authStore = useAuthStore();

const eventId = computed(() => route.params.id as string);

// Fetch event data
const { data: event, pending, error } = await getEventById(eventId.value);

// Check if current user is organizer
const isOrganizer = computed(() => {
    if (!authStore.user || !event.value) return false;
    return event.value.organizerId === authStore.user.id;
});

// Check if current user is photographer
const isPhotographer = computed(() => {
    return authStore.user?.role === 'photographer';
});

// Format date
const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Get sport type label
const getSportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
        running: '跑步',
        cycling: '自行車',
        triathlon: '三鐵',
        swimming: '游泳',
        basketball: '籃球',
        soccer: '足球',
        tennis: '網球',
        other: '其他'
    };
    return types[type] || type;
};

// Get status label
const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        draft: '草稿',
        published: '已發佈',
        completed: '已完成'
    };
    return labels[status] || status;
};

// Get status severity
const getStatusSeverity = (status: string) => {
    const severities: Record<string, string> = {
        draft: 'secondary',
        published: 'success',
        completed: 'info'
    };
    return severities[status] || 'secondary';
};

// Handle edit
const handleEdit = () => {
    // TODO: Implement edit functionality
    router.push(`/events/${eventId.value}/edit`);
};

// Handle delete
const handleDelete = async () => {
    if (!confirm('確定要刪除此賽事嗎？此操作無法復原。')) {
        return;
    }

    const res = await deleteEvent(eventId.value);
    if (res.success) {
        router.push('/events');
    } else {
        alert(res.error);
    }
};
</script>
