import { useRoutes } from 'react-router-dom';
import {appRoutes} from './routes.registry'
import {applyGuards} from './guards'
import {applyLayouts} from './layouts';

export default function AppRouter() {
  const guarded = applyGuards(appRoutes);
  const finalRoutes = applyLayouts(guarded);
  return useRoutes(finalRoutes);
}
