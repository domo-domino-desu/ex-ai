import presetIcons from '@unocss/preset-icons/browser'

import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from '@unocss/runtime'

export default defineConfig({
  presets: [
    presetWind3({ prefix: 'un-' }),
    presetIcons({ cdn: 'https://esm.sh/' }),
  ],
})
