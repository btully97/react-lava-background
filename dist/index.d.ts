import * as React from 'react';

interface LavaLampProps {
    blobCount?: number;
    minRadius?: number;
    maxRadius?: number;
    speed?: number;
    blobColors?: [string, string, string];
    pixelSkip?: number;
}
declare const LavaLampBackground: React.FC<LavaLampProps>;

export { LavaLampBackground as default };
