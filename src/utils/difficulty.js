// Maps a difficulty label to the Badge color it should render with.
export function diffTone(difficulty) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "amber";
  return "red";
}
