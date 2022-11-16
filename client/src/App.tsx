/* eslint-disable require-jsdoc */
import React from "react";

const defaultParams = {
  "names": ["Bob", "Alice"],
  "bios": [
    "I am a biology student, I like to play basketball on my free time",
    "I am a computer science student, " +
    "I like to play video games on my free time",
  ],
};

// a basic, minimalist style for textarea that make it not too ugly
const notTooUglyTextArea = {
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "4px",
};

const url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function App() {
  const [suggestions, setSuggestions] = React.useState([]);
  const [error, setError] = React.useState("");
  const [names, setNames] = React.useState<string[]>(defaultParams.names);
  const [bios, setBios] = React.useState<string[]>(defaultParams.bios);
  const [loading, setLoading] = React.useState(false);
  console.log("suggestions", suggestions);

  const query = async () => {
    setLoading(true);
    setError("");
    setSuggestions([]);
    const param = {
      "names": names,
      "bios": bios,
    };
    fetch(url, {
      method: "POST",
      body: JSON.stringify(param),
      // mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        // "Origin": "http://localhost:8080",

        // "Origin": "http://localhost:3000",
        // "Access-Control-Allow-Origin": "*",
      },
    }).then(async (r) => {
      // console.log(r);
      // console.log(await r.text());
      if (r.status !== 200) {
        setError("Error: " + r.status);
        return;
      }
      const rJson = await r.json();
      console.log(rJson["results"]);
      setSuggestions(rJson["results"].map((x: any) =>
        x["conversation_starter"]["en"]));
    }).catch((e) => {
      setError(e.error);
    }).finally(() => {
      setLoading(false);
    });
  };
  // Two input texts aligned side by side with a button below, between them
  return (
    <div
      // list of stuff center aligned
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        // two input texts aligned side by side
        // and a button below
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          // two input texts aligned side by side
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            // a text input for the name
            // and below, a text input for the bio
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            <input type="text"
              style={{
                margin: "10px",
              }}
              placeholder="Name"
              value={names[0]}
              onChange={(e) => setNames([e.target.value, names[1]])}
            />
            <textarea
              style={notTooUglyTextArea}
              placeholder="Bio"
              cols={30}
              rows={10}
              value={bios[0]}
              onChange={(e) => setBios([e.target.value, bios[1]])}
            />
          </div>
          <div
            // a text input for the name
            // and below, a text input for the bio
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            <input type="text"
              style={{
                margin: "10px",
              }}
              placeholder="Name"
              value={names[1]}
              onChange={(e) => setNames([names[0], e.target.value])}
            />
            <textarea
              style={notTooUglyTextArea}
              placeholder="Bio"
              cols={30}
              rows={10}
              value={bios[1]}
              onChange={(e) => setBios([bios[0], e.target.value])}
            />
          </div>
        </div>
        <button
          style={{
            // minimal styling that make it beautiful
            width: "10rem",
            height: "4rem",
            fontSize: "1rem",
            padding: "0.5rem",
            marginTop: "1rem",
            color: "white",
            backgroundColor: loading ? "grey" : "blue",
            border: "none",
            borderRadius: "0.5rem",
            // hover effect
            cursor: "pointer",
          }}
          onClick={query}
          disabled={loading}
        >Get conversation starter suggestions</button>
      </div>
      <p style={{
        color: "red",
      }}>{error}</p>
      <textarea
        style={{...notTooUglyTextArea, width: "50%"}}
        disabled
        placeholder="Suggestions"
        cols={30}
        rows={10}
        value={suggestions.join("\n---\n")}
      />
    </div>
  );
}

export default App;
