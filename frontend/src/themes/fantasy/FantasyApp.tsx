import '../../app/App.css'
import Book from '../../book/Book'
import SketchCursor from '../../components/SketchCursor'
import './fantasy.css'

export default function FantasyApp() {
  return (
    <div className="app">
      <SketchCursor />
      <main className="app-main">
        <Book />
      </main>
    </div>
  )
}
