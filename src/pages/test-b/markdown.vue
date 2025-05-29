<template>
    <article class="prose m-auto">
        <VueMarkdown :source="value" :options="options"></VueMarkdown>
    </article>
</template>
<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render'
import hljs from 'highlight.js'
import 'highlight.js/styles/a11y-dark.min.css'

defineProps({
    value: String
})

const options = {
    highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
}
</script>