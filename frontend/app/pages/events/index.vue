<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">賽事列表</h1>
            <Button
                v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'organizer'"
                label="建立賽事"
                icon="pi pi-plus"
                as="router-link"
                to="/events/create"
            />
        </div>

        <div v-if="pending" class="flex justify-center py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
        </div>

        <div v-else-if="error" class="text-center py-12 text-red-500">載入失敗，請稍後再試</div>

        <div v-else-if="!events || events.length === 0" class="text-center py-12 text-gray-500">目前沒有任何賽事</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                v-for="event in events"
                :key="event.id"
                class="hover:shadow-lg transition-shadow cursor-pointer"
                @click="$router.push(`/events/${event.id}`)"
            >
                <template #header>
                    <div v-if="event.coverImage" class="h-48 overflow-hidden">
                        <img :src="event.coverImage" :alt="event.name" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                        <i class="pi pi-image text-4xl"></i>
                    </div>
                </template>
                <template #title>
                    <div class="flex justify-between items-start">
                        <span>{{ event.name }}</span>
                        <Tag :value="getStatusLabel(event.status)" :severity="getStatusSeverity(event.status)" />
                    </div>
                </template>
                <template #subtitle>
                    <div class="flex flex-col gap-1 mt-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar"></i>
                            <span>{{ formatDate(event.date as string) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-map-marker"></i>
                            <span>{{ event.location }}</span>
                        </div>
                        <div v-if="event.sportType" class="flex items-center gap-2 mt-1">
                            <Tag :value="getSportTypeLabel(event.sportType)" severity="info" size="small" />
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button
                        label="查看詳情"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        class="w-full"
                        @click.stop="$router.push(`/events/${event.id}`)"
                    />
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
const { getEvents } = useEvents();
const authStore = useAuthStore();

const { data: events, pending, error } = await getEvents();

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
};

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

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        draft: '草稿',
        published: '已發佈',
        completed: '已完成'
    };
    return labels[status] || status;
};

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'published':
            return 'success';
        case 'draft':
            return 'secondary';
        case 'completed':
            return 'info';
        default:
            return 'contrast';
    }
};
</script>
