import {useState} from "react";

const Home = () => {
	const [userInput, setUserInput] = useState("");
	const [response, setResponse] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const searchResponse = await fetch("/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({question: userInput}),
		});

		const {question} = await searchResponse.json();
		setResponse(question);
	};

	return (
		<div className="flex justify-center">
			<div className="mt-24 w-full max-w-xl">
				<form
					onSubmit={handleSubmit}
					className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
					{response && (
						<div className="text-left mt-4">
							<p>{response}</p>
						</div>
					)}
				</form>
			</div>
		</div>
	);
};

export default Home;
