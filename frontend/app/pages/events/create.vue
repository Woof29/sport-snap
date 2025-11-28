<template>
    <div class="container mx-auto px-4 py-8 max-w-2xl">
        <Button label="返回列表" icon="pi pi-arrow-left" variant="text" class="mb-4" @click="$router.back()" />

        <Card>
            <template #title>
                <h1 class="text-2xl font-bold text-center">建立新賽事</h1>
            </template>

            <template #content>
                <form @submit.prevent="handleSubmit" class="space-y-6 mt-4">
                    <div class="flex flex-col gap-2">
                        <label for="name" class="font-medium">賽事名稱</label>
                        <InputText id="name" v-model="form.name" required placeholder="例如：2024 台北馬拉松" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="date" class="font-medium">日期</label>
                        <DatePicker id="date" v-model="form.date" showIcon fluid dateFormat="yy-mm-dd" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="location" class="font-medium">地點</label>
                        <InputText id="location" v-model="form.location" required placeholder="例如：台北市政府廣場" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="description" class="font-medium">賽事描述</label>
                        <Textarea
                            id="description"
                            v-model="form.description"
                            rows="4"
                            placeholder="詳細描述賽事內容、規則等資訊..."
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="sport_type" class="font-medium">運動類型</label>
                        <Select
                            id="sport_type"
                            v-model="form.sport_type"
                            :options="sportTypes"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="選擇運動類型"
                            fluid
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="cover_image" class="font-medium">封面圖片 URL</label>
                        <InputText
                            id="cover_image"
                            v-model="form.cover_image"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="max_participants" class="font-medium">參賽人數上限</label>
                        <InputNumber
                            id="max_participants"
                            v-model="form.max_participants"
                            placeholder="例如：1000"
                            fluid
                        />
                    </div>

                    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

                    <div class="flex gap-4 pt-4">
                        <Button
                            type="button"
                            label="取消"
                            severity="secondary"
                            variant="outlined"
                            class="flex-1"
                            @click="$router.back()"
                        />
                        <Button type="submit" label="建立賽事" class="flex-1" :loading="loading" />
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
const { createEvent } = useEvents();
const router = useRouter();

const sportTypes = [
    { label: '跑步', value: 'running' },
    { label: '自行車', value: 'cycling' },
    { label: '三鐵', value: 'triathlon' },
    { label: '游泳', value: 'swimming' },
    { label: '籃球', value: 'basketball' },
    { label: '足球', value: 'soccer' },
    { label: '網球', value: 'tennis' },
    { label: '其他', value: 'other' }
];

const form = reactive({
    name: '',
    date: null,
    location: '',
    description: '',
    sport_type: '',
    cover_image: '',
    max_participants: null
});

const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
    if (!form.name || !form.date || !form.location) {
        error.value = '請填寫所有欄位';
        return;
    }

    loading.value = true;
    error.value = '';

    const res = await createEvent({
        ...form,
        date: form.date // DatePicker returns Date object
    });

    if (res.success) {
        router.push('/events');
    } else {
        error.value = res.error;
    }

    loading.value = false;
};
</script>
