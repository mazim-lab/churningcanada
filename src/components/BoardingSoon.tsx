export function BoardingSoon({ title }: { title: string }) {
  return (
    <div className="app norail">
      <main>
        <div className="head"><h1>{title}</h1></div>
        <div className="placeholder">Boarding soon <span className="cursor">_</span></div>
      </main>
    </div>
  );
}
