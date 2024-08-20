import {useState} from "react";
import {ArticleChunk} from "@/types";

const Home = () => {
	const [userInput, setUserInput] = useState("");
	const [response, setResponse] = useState("");
	const [chunks, setChunks] = useState<ArticleChunk[]>([]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setResponse("");
		setChunks([]);
		e.preventDefault();
		if (userInput.trim() === "") {
			return;
		}
		const searchResponse = await fetch("/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({question: userInput}),
		});

		const {chunks: searchChunks} = await searchResponse.json();
		setChunks(searchChunks);

		const answerResponse = await fetch("/api/answer", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({prompt: userInput}),
		});

		const {answer} = await answerResponse.json();
		setResponse(answer);
	};

	return (
		<div className="flex flex-col items-center">
			<h1 className="text-4xl font-bold mt-8 mb-12 text-blue-600">
				Cursor
			</h1>
			<div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
				<form
					onSubmit={handleSubmit}
					className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
					<div className="mb-4">
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							type="text"
							placeholder="Ask a question"
							value={userInput}
							onChange={e => setUserInput(e.target.value)}
						/>
					</div>
					<div className="flex items-center justify-center mb-4">
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							type="submit">
							Submit
						</button>
					</div>
					<div className="text-left mt-4">
						{response ? (
							<>
								<p className="mb-4">{response}</p>
								{chunks.length > 0 && (
									<>
										<h2 className="text-2xl font-semibold mb-3">
											Read more
										</h2>
										<ul className="space-y-3">
											{chunks
												.filter(
													(chunk, index, self) =>
														index ===
														self.findIndex(
															t =>
																t.article_url ===
																chunk.article_url
														)
												)
												.map((chunk, index) => (
													<li
														key={index}
														className="border-b pb-2">
														<a
															href={
																chunk.article_url
															}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-800 font-medium">
															{
																chunk.article_title
															}
														</a>
													</li>
												))}
										</ul>
									</>
								)}
							</>
						) : (
							<p className="text-gray-500">Summary here</p>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default Home;
