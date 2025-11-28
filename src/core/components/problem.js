export function problem ({
	message
})
{
	return `<div class="layout layout--col home-trmnl-error">
		<style>
			.home-trmnl-error__icon {
				width: 20%;
				height: auto;
			}
			.home-trmnl-error__message {
				margin-top: 10px;
			}
		</style>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="home-trmnl-error__icon">
			<path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 2H8L2 8v8l6 6h8l6-6V8zM12 8v4M12 16.02V16" />
		</svg>
		<p class="label text--black home-trmnl-error__message">
			${ message }
		</p>
	</div>`;
}
