<template>
    <div class="markdown-content">
        <VueMarkdown :source="value" :options="opts" />
    </div>
</template>

<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render'
import hljs from 'highlight.js' // https://highlightjs.org
import 'highlight.js/styles/default.min.css'

// Actual default values
const opts = {
    highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
}

defineProps({
    value: {
        type: String,
        default: ''
    }
})

</script>