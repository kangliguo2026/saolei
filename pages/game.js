import withAuth from '../components/withAuth';
import Minesweeper from '../components/Minesweeper';

function Game({ user }) {
  return <Minesweeper user={user} />;
}

export default withAuth(Game);
