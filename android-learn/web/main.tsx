import { createRoot } from 'react-dom/client'
import LearnApp from '../../app/learn/LearnApp'
import ptBR from '../../lib/learn/decks/pt-br'

createRoot(document.getElementById('root')!).render(<LearnApp deck={ptBR} embedded />)
