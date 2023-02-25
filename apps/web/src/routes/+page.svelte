<script lang="ts">
	import { v4 as uuid } from 'uuid';

	import { createDocumentStore } from '$lib/stores/document';

	type Todo = { id: string; title: string; done: boolean };
	type Doc = { id: string; todos: Todo[] };

	let docID = '1234';

	let inputValue = '';

	let documentStore = createDocumentStore<Doc>({
		docID
	});

	function addTodo(title: string) {
		documentStore.change((doc) => {
			doc.todos.push({
				id: uuid(),
				title,
				done: false
			});
		});
	}

	function toggleDone(todo: Todo) {
		documentStore.change((doc) => {
			const t = doc.todos.find((t) => t.id === todo.id);
			if (t) {
				t.done = !t.done;
			}
		});
	}
</script>

<div>
	<form
		on:submit={(e) => {
			e.preventDefault();
			if (inputValue) {
				addTodo(inputValue);
				inputValue = '';
			}
		}}
	>
		<label for="todo">Add todo:</label>
		<input id="todo" placeholder="Todo..." bind:value={inputValue} />
	</form>
</div>

<div>
	{#each $documentStore.todos ?? [] as todo}
		<div>
			<input
				type="checkbox"
				checked={todo.done}
				on:change={() => {
					toggleDone(todo);
				}}
			/>&nbsp;
			<span>{todo.title}</span>
		</div>
	{/each}
</div>
