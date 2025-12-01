
export function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
}

export function int16ToFloat32(int16: Int16Array): Float32Array {
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// High-quality downsampling using averaging (Box Filter) to prevent aliasing
export function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
  if (outputSampleRate === inputSampleRate) {
    return buffer;
  }
  
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.ceil(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
      const nextOffset = (i + 1) * sampleRateRatio;
      const currentOffset = i * sampleRateRatio;
      
      let sum = 0;
      let count = 0;
      
      const start = Math.floor(currentOffset);
      const end = Math.ceil(nextOffset);
      
      // Average all samples within the window
      for (let j = start; j < end && j < buffer.length; j++) {
          sum += buffer[j];
          count++;
      }
      
      result[i] = count > 0 ? sum / count : 0;
  }
  
  return result;
}
