<template>
  <div class="custom-pic">
      <img
        :src="computedSrc"
        :class="['pic-img', customClass]"
        :style="computedStyle"
      />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  picSrc: {
    type: String,
    default: ''
  },
  customStyle: {
    type: Object,
    default: () => ({})
  },
  customClass: {
    type: String,
    default: ''
  },
})

// 基础路径配置
const basePath = import.meta.env.VITE_BASE_API || '/web'

// 计算图片完整路径
const computedSrc = computed(() => {
  if (!props.picSrc) return ''
  // 如果是完整的 http/https URL，直接返回
  if (props.picSrc.startsWith('http://') || props.picSrc.startsWith('https://')) {
    return props.picSrc
  }
  // 如果是相对路径，拼接基础路径
  // 确保路径格式正确
  const src = props.picSrc.startsWith('/') ? props.picSrc : `/${props.picSrc}`
  return `${basePath}${src}`
})


// 计算样式
const computedStyle = computed(() => {
  return props.customStyle
})

</script>

<style scoped>
.custom-pic {
  display: inline-block;
}

.pic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
