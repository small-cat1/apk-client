import { createPinia } from 'pinia'
import { useUserStore } from '@/pinia/modules/user'

const store = createPinia()
export { store,  useUserStore }
