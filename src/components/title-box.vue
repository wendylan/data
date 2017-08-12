<script>
	export default{
		props : {
			text : {
				type : Array
			}
		}
	}
</script>

<template>
	<div class="">
		<h1>{{ text[0] }}</h1>
		<h4>{{ text[1] }}</h4>
		<slot></slot>
		<hr>
	</div>
</template>

<style scoped>
	h1,h4{
		font-weight:400;
	}
	h4{
		color:#8492A6;
	}
</style>
