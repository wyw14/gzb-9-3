<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div>
        <h1 style="color:white;margin-bottom:8px;">我的收藏</h1>
        <p style="color:rgba(255,255,255,0.8);">收藏心仪的盲盒，随时关注交换状态</p>
      </div>
      <div style="color:white;font-size:14px;">
        共 {{ favorites.length }} 个收藏
      </div>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:white;">
      加载中...
    </div>

    <div v-else-if="favorites.length === 0" class="empty-state card">
      <h2>暂无收藏</h2>
      <p>快去逛逛盲盒市场，收藏你喜欢的盲盒吧！</p>
      <router-link to="/" style="margin-top:16px;display:inline-block;">
        <button class="btn btn-primary">去逛逛</button>
      </router-link>
    </div>

    <div v-else class="grid grid-3">
      <div
        v-for="fav in favorites"
        :key="fav.id"
        class="card"
        style="padding:0;overflow:hidden;position:relative;"
        :class="{ 'favorite-item-deleted': fav.status === 'deleted' }"
      >
        <button
          class="remove-favorite-btn"
          @click="handleRemoveFavorite(fav)"
          title="取消收藏"
        >
          ✕
        </button>

        <template v-if="fav.item">
          <router-link
            :to="'/item/' + fav.item.id"
            style="text-decoration:none;color:inherit;display:block;"
          >
            <div style="width:100%;height:200px;overflow:hidden;background:#f0f0f0;position:relative;">
              <img :src="appendAuth(fav.item.image)" alt="盲盒图片"
                   style="width:100%;height:100%;object-fit:cover;"/>
              <div style="position:absolute;top:12px;left:12px;">
                <span :class="getStatusBadgeClass(fav.status)">
                  {{ getStatusText(fav.status) }}
                </span>
              </div>
            </div>
            <div style="padding:16px;">
              <h3 style="margin-bottom:8px;font-size:16px;">{{ getCategoryName(fav.item.category) }}</h3>
              <div style="margin-bottom:8px;">
                <span v-for="tag in fav.item.mysteryTags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
              <p style="color:#999;font-size:12px;margin-bottom:4px;">
                发布者：{{ fav.item.ownerName }}
              </p>
              <p style="color:#bbb;font-size:11px;">
                收藏于 {{ formatDate(fav.createdAt) }}
              </p>
            </div>
          </router-link>
        </template>

        <template v-else>
          <div style="width:100%;height:200px;overflow:hidden;background:#f0f0f0;position:relative;">
            <div class="deleted-overlay">
              物品已删除
            </div>
          </div>
          <div style="padding:16px;">
            <h3 style="margin-bottom:8px;font-size:16px;color:#999;">未知物品</h3>
            <div style="margin-bottom:8px;">
              <span class="badge badge-deleted">已删除</span>
            </div>
            <p style="color:#bbb;font-size:11px;">
              收藏于 {{ formatDate(fav.createdAt) }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyFavorites, removeFavorite, appendAuth } from '../api/index.js'
import { userStore } from '../store/user.js'

const favorites = ref([])
const loading = ref(true)

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

function getStatusText(status) {
  switch (status) {
    case 'available':
      return '可交换'
    case 'exchanged':
      return '已交换'
    case 'deleted':
      return '已删除'
    default:
      return status
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'available':
      return 'badge badge-available'
    case 'exchanged':
      return 'badge badge-exchanged'
    case 'deleted':
      return 'badge badge-deleted'
    default:
      return 'badge'
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

async function loadFavorites() {
  loading.value = true
  try {
    favorites.value = await getMyFavorites(userStore.user.id)
  } catch (e) {
    console.error(e)
    alert('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

async function handleRemoveFavorite(fav) {
  if (!confirm('确定要取消收藏吗？')) {
    return
  }
  try {
    await removeFavorite(fav.itemId, userStore.user.id)
    favorites.value = favorites.value.filter(f => f.id !== fav.id)
  } catch (e) {
    alert('取消收藏失败：' + (e.response && e.response.data ? e.response.data.error : e.message))
  }
}

onMounted(loadFavorites)
</script>
