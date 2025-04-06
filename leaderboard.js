const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

// Sort by score descending
leaderboard.sort((a, b) => b.score - a.score);

const tbody = document.getElementById("leaderboard-body");

leaderboard.forEach((entry, index) => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${index + 1}</td>
    <td>${entry.user}</td>
    <td>${entry.score}</td>
    <td>${entry.date}</td>
  `;

  tbody.appendChild(tr);
});
