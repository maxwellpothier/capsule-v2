import {useState} from "react";

const Home = () => {
	const [userInput, setUserInput] = useState("");
	const [response, setResponse] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

		const {chunks} = await searchResponse.json();

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
							<p>{response}</p>
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
