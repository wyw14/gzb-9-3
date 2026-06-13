<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div>
        <h1 style="color:white;margin-bottom:8px;">盲盒市场</h1>
        <p style="color:rgba(255,255,255,0.8);">发现神秘盲盒，开启惊喜交换</p>
      </div>
      <router-link to="/publish">
        <button class="btn btn-primary" style="padding:12px 28px;font-size:16px;">
          发布我的盲盒
        </button>
      </router-link>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:white;">
      加载中...
    </div>

    <div v-else-if="items.length === 0" class="empty-state card">
      <h2>暂无盲盒</h2>
      <p>还没有人发布盲盒，快来发布第一个吧！</p>
    </div>

    <div v-else class="grid grid-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="card"
        style="padding:0;overflow:hidden;cursor:pointer;position:relative;"
      >
        <button
          class="card-favorite-btn"
          :class="{ 'card-favorited': isItemFavorited(item.id) }"
          @click.stop="toggleCardFavorite(item)"
          :title="isItemFavorited(item.id) ? '取消收藏' : '收藏'"
        >
          {{ isItemFavorited(item.id) ? '❤️' : '🤍' }}
        </button>

        <router-link
          :to="'/item/' + item.id"
          style="text-decoration:none;color:inherit;display:block;"
        >
          <div style="width:100%;height:200px;overflow:hidden;background:#f0f0f0;position:relative;">
            <img :src="appendAuth(item.image)" alt="盲盒图片"
                 style="width:100%;height:100%;object-fit:cover;"/>
            <div style="position:absolute;top:12px;left:12px;">
              <span :class="item.status === 'available' ? 'badge badge-available' : 'badge badge-exchanged'">
                {{ item.status === 'available' ? '可交换' : '已交换' }}
              </span>
            </div>
          </div>
          <div style="padding:16px;">
            <h3 style="margin-bottom:8px;font-size:16px;">{{ getCategoryName(item.category) }}</h3>
            <div style="margin-bottom:8px;">
              <span v-for="tag in item.mysteryTags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <p style="color:#999;font-size:12px;">
              发布于 {{ formatDate(item.createdAt) }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getItems, appendAuth, getMyFavorites, addFavorite, removeFavorite } from '../api/index.js'
import { userStore } from '../store/user.js'

const items = ref([])
const loading = ref(true)
const favoritedItemIds = ref(new Set())
const togglingFavorites = ref(new Set())

const categories = {
  book: '书籍类',
  figure: '手办类',
  toy: '玩具类',
  game: '游戏类',
  digital: '数码类',
  other: '其他'
}

function getCategoryName(key) {
  return categories[key] || key
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

async function loadItems() {
  loading.value = true
  try {
    items.value = await getItems(userStore.user.id)
    await loadFavorites()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadFavorites() {
  try {
    const favorites = await getMyFavorites(userStore.user.id)
    favoritedItemIds.value = new Set(
      favorites.filter(f => f.item).map(f => f.itemId)
    )
  } catch (e) {
    console.error(e)
  }
}

function isItemFavorited(itemId) {
  return favoritedItemIds.value.has(itemId)
}

async function toggleCardFavorite(item) {
  if (togglingFavorites.value.has(item.id)) return
  
  togglingFavorites.value.add(item.id)
  try {
    if (favoritedItemIds.value.has(item.id)) {
      await removeFavorite(item.id, userStore.user.id)
      favoritedItemIds.value.delete(item.id)
    } else {
      await addFavorite(item.id, userStore.user.id)
      favoritedItemIds.value.add(item.id)
    }
  } catch (e) {
    alert('操作失败：' + (e.response && e.response.data ? e.response.data.error : e.message))
  } finally {
    togglingFavorites.value.delete(item.id)
  }
}

onMounted(loadItems)
</script>
