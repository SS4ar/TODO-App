<template>
    <v-container fluid>
        <v-btn @click="deleteAll" class="ma-2" color="red" dark>Удалить все</v-btn>
        <v-row class="mb-3">
            <v-col cols="12" class="text-center">
                <v-btn color="#B491E5" dark text class="ma-2 my-auto" @click="dialog = true" style="color: white">Добавить новое дело</v-btn>
            </v-col>
        </v-row>
        <v-dialog v-model="dialog" max-width="500">
            <v-card>
                <v-card-title class="headline">Добавление нового дела</v-card-title>
                <v-card-text>
                    <v-text-field label="Название" v-model="newItem.title"></v-text-field>
                    <v-textarea label="Описание" v-model="newItem.description"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="white" @click="addNewTask">Добавить</v-btn>
                    <v-btn @click="dialog = false">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="editDialog" max-width="500">
            <v-card>
                <v-card-title class="headline">Редактирование дела</v-card-title>
                <v-card-text>
                    <v-text-field label="Название" v-model="editedItem.title"></v-text-field>
                    <v-textarea label="Описание" v-model="editedItem.description"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="white" @click="updateItem">Сохранить</v-btn>
                    <v-btn @click="editDialog = false">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-row justify="center" align="center">
            <v-col cols="12" md="8" lg="6">
                <v-card v-for="(item, index) in items" :key="index" class="mb-3">
                    <v-card-title :class="{ 'text-decoration-line-through': item.isDone }">{{ item.title }}</v-card-title>
                    <v-card-text :class="{ 'text-decoration-line-through': item.isDone }">{{ item.description }}</v-card-text>
                    <v-card-actions>
                        <v-btn color="white" @click="editItem(index)">Редактировать</v-btn>
                        <v-btn color="red" @click="deleteItem(index)">Удалить</v-btn>
                        <v-btn @click="toggleIsDone(item)" color="white">{{item.isDone ? 'Отменить выполнение':'Выполнено'}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            editDialog: false,
            items: [],
            dialog: false,
            newItem: {
                title: '',
                description: '',
            },
            loading: false,
            editedItem: {
                id: null,
                title: '',
                description: '',
            },
        };
    },
    async created() {
        this.getItems();
    },
    methods: {
        async getItems() {
            this.loading = true;
            try {
                const response = await axios.get('http://localhost:3010/api/todos/');
                this.items = response.data.map(item => ({ ...item}));
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        async deleteItem(index) {
            await axios.delete(`http://localhost:3010/api/todos/${this.items[index].id}`);
            this.items.splice(index, 1);
        },
        addNewTask() {
            if (!this.newItem.title || !this.newItem.description) {
                return;
            }
            this.loading = true;
            axios.post('http://localhost:3010/api/todos', {
                title: this.newItem.title,
                description: this.newItem.description,
                isDone: false,
            })
                .then(() => {
                    this.dialog = false;
                    this.getItems();
                    this.newItem = { title: '', description: ''};
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        editItem(index) {
            this.editDialog = true;
            const item = this.items[index];
            this.editedItem = {
                id: item.id,
                title: item.title,
                description: item.description,
                isDone: item.isDone,
            };
        },
        async updateItem() {
            const { id, title, description } = this.editedItem;
            await axios.patch(`http://localhost:3010/api/todos/${id}`, { title, description });
            const index = this.items.findIndex(item => item.id === id);
            this.items.splice(index, 1, { id, title, description });
            this.editDialog = false;
        },
        async toggleIsDone(task) {
            const updatedTask = {
                title: task.title,
                description: task.description,
                isDone: !task.isDone
            };
            await axios.patch(`http://localhost:3010/api/todos/${task.id}`, updatedTask);
            this.getItems();
        },
        async deleteAll() {
           await axios.delete('http://localhost:3010/api/todos/');
            this.getItems();
        }
    },

};
</script>

<style scoped>
.v-card {
    background-color: #B491E5;
    margin: 10px;
    padding: 20px;
    color: white;
}
.text-decoration-line-through {
    text-decoration: line-through;
    text-decoration-color: black;
    opacity: 0.7;

}

</style>
