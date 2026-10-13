import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import DeckGame from './pages/games/DeckGame'
import SevenSecGame from './pages/games/SevenSecGame'
import YamsGame from './pages/games/YamsGame'
import DebatGame from './pages/games/DebatGame'
import RaconteMoiGame from './pages/games/RaconteMoiGame'
import SynapseGame from './pages/games/SynapseGame'
import DevineQuiGame from './pages/games/DevineQuiGame'
import UniversalMindGame from './pages/games/UniversalMindGame'
import DesoleGame from './pages/games/DesoleGame'
import ParasiteGame from './pages/games/ParasiteGame'
import GalerieGame from './pages/games/GalerieGame'
import MessMemeGame from './pages/games/MessMemeGame'
import BombGame from './pages/games/BombGame'
import LaTaupeGame from './pages/games/LaTaupeGame'
import SpyGame from './pages/games/SpyGame'
import AliasGame from './pages/games/AliasGame'
import ClasseMoiCaGame from './pages/games/ClasseMoiCaGame'
import LimitePrisonGame from './pages/games/LimitePrisonGame'
import SwitchGame from './pages/games/SwitchGame'

// Salles multi-téléphones (WebSockets STOMP + Spring Boot)
import BombRoom from './pages/games/BombRoom'
import LimitePrisonRoom from './pages/games/LimitePrisonRoom'
import ClasseMoiCaRoom from './pages/games/ClasseMoiCaRoom'
import LaTaupeRoom from './pages/games/LaTaupeRoom'
import SpyRoom from './pages/games/SpyRoom'
import AliasRoom from './pages/games/AliasRoom'
import SevenSecRoom from './pages/games/SevenSecRoom'
import ParasiteRoom from './pages/games/ParasiteRoom'
import SynapseRoom from './pages/games/SynapseRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Jeux 1 téléphone (Pass & Play / Solo / Local) */}
      <Route path="/jeux/7sec" element={<SevenSecGame />} />
      <Route path="/jeux/yams" element={<YamsGame />} />
      <Route path="/jeux/debat" element={<DebatGame />} />
      <Route path="/jeux/racontemoi" element={<RaconteMoiGame />} />
      <Route path="/jeux/synapse" element={<SynapseGame />} />
      <Route path="/jeux/devinequi" element={<DevineQuiGame />} />
      <Route path="/jeux/universalmind" element={<UniversalMindGame />} />
      <Route path="/jeux/desole" element={<DesoleGame />} />
      <Route path="/jeux/parasite" element={<ParasiteGame />} />
      <Route path="/jeux/galerie" element={<GalerieGame />} />
      <Route path="/jeux/messmeme" element={<MessMemeGame />} />
      <Route path="/jeux/bomb" element={<BombGame />} />
      <Route path="/jeux/lataupe" element={<LaTaupeGame />} />
      <Route path="/jeux/spy" element={<SpyGame />} />
      <Route path="/jeux/alias" element={<AliasGame />} />
      <Route path="/jeux/classemoica" element={<ClasseMoiCaGame />} />
      <Route path="/jeux/limiteprison" element={<LimitePrisonGame />} />
      <Route path="/jeux/switch" element={<SwitchGame />} />

      {/* Jeux de cartes génériques (jenaijamais, tupreferes, vraioufaux, voteoushot, juge) */}
      <Route path="/jeux/:gameId" element={<DeckGame />} />

      {/* Salles multi-téléphones en direct */}
      <Route path="/salle/bomb" element={<BombRoom />} />
      <Route path="/salle/bomb/:code" element={<BombRoom />} />

      <Route path="/salle/limiteprison" element={<LimitePrisonRoom />} />
      <Route path="/salle/limiteprison/:code" element={<LimitePrisonRoom />} />

      <Route path="/salle/classemoica" element={<ClasseMoiCaRoom />} />
      <Route path="/salle/classemoica/:code" element={<ClasseMoiCaRoom />} />

      <Route path="/salle/lataupe" element={<LaTaupeRoom />} />
      <Route path="/salle/lataupe/:code" element={<LaTaupeRoom />} />

      <Route path="/salle/spy" element={<SpyRoom />} />
      <Route path="/salle/spy/:code" element={<SpyRoom />} />

      <Route path="/salle/alias" element={<AliasRoom />} />
      <Route path="/salle/alias/:code" element={<AliasRoom />} />

      <Route path="/salle/7sec" element={<SevenSecRoom />} />
      <Route path="/salle/7sec/:code" element={<SevenSecRoom />} />

      <Route path="/salle/parasite" element={<ParasiteRoom />} />
      <Route path="/salle/parasite/:code" element={<ParasiteRoom />} />

      <Route path="/salle/synapse" element={<SynapseRoom />} />
      <Route path="/salle/synapse/:code" element={<SynapseRoom />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
