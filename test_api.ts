import fetch from "node-fetch";

async function run() {
  const res = await fetch("http://localhost:3000/api/v1/hr/performance/cycles");
  console.log(await res.text());
}
run();
