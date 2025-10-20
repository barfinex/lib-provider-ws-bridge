import { DynamicModule } from '@nestjs/common';
import { WsBridgeOptions } from './types';
export declare class ProviderWsBridgeModule {
    static forRoot(options: WsBridgeOptions): DynamicModule;
    static forRootAsync(asyncOptions: {
        useFactory: (...args: any[]) => Promise<WsBridgeOptions> | WsBridgeOptions;
        inject?: any[];
        imports?: any[];
    }): DynamicModule;
}
