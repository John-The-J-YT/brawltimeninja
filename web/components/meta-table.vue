<template>
  <card md>
    <table slot="content" class="w-full">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th scope="col" class="text-right pr-2">
            #
          </th>
          <th scope="col" class="text-left">
            Name
          </th>
          <th scope="col" class="text-left">
            {{ metaStatMaps.labels[stat] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, index) in sortedEntries"
          :key="entry.id"
        >
          <th scope="row" class="text-right pr-2 pt-1">
            {{ entry.sampleSize < sampleSizeThreshold ? '?' : index + 1 }}
          </th>
          <td>
            <nuxt-link
              :to="entry.link || ''"
              :title="entry.title"
              class="flex items-center"
            >
              <div class="mr-2 w-12 md:w-12 bg-gray-900 rounded-sm relative">
                <media-img
                  :path="`/brawlers/${brawlerId({ name: entry.brawler })}/avatar`"
                  :alt="entry.brawler"
                  size="160"
                  clazz="h-8 md:h-10"
                />
                <media-img
                  v-if="entry.icon"
                  :path="entry.icon"
                  :alt="entry.title"
                  size="80"
                  clazz="h-5 md:h-6 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-px"
                />
              </div>
              <span class="font-semibold text-lg">{{ entry.title }}</span>
            </nuxt-link>
          </td>
          <td class="text-left font-semibold text-lg">
            {{ entry.sampleSize < sampleSizeThreshold ? '?' : typeof entry.stats[stat] == 'string' ? entry.stats[stat] : metaStatMaps.formatters[stat](entry.stats[stat]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1 } from '../lib/util'

export default Vue.extend({
  props: {
    stat: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
    today(): string {
      return new Date().toLocaleDateString()
    },
    sortedEntries(): MetaGridEntry[] {
      const aboveThreshold = this.entries.filter(e => e.sampleSize >= this.sampleSizeThreshold)
      const belowThreshold = this.entries.filter(e => e.sampleSize < this.sampleSizeThreshold)
      return aboveThreshold.sort(compare1(this.stat as any))
        .concat(belowThreshold)
    },
  },
})
</script>
