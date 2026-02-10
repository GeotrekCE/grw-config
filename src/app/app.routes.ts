import { Routes } from '@angular/router';
import { WidgetFrameComponent } from './components/widget-frame/widget-frame.component';
import { ConfiguratorLayoutComponent } from './components/configurator-layout/configurator-layout.component';

export const routes: Routes = [
    { path: '', component: ConfiguratorLayoutComponent },
    { path: 'preview', component: WidgetFrameComponent }
];
