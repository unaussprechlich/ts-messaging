export class MagicByteSerializer {
  static readonly magicByte: Buffer = Buffer.alloc(1);

  static encode(payload: Buffer, registryId?: number) {
    const registryIdBuffer = Buffer.alloc(4);
    registryIdBuffer.writeInt32BE(registryId ?? -1);

    return Buffer.concat([
      MagicByteSerializer.magicByte,
      registryIdBuffer,
      payload,
    ]);
  }

  static decode(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer)) {
      return null;
    }

    if (buffer.length < 5) {
      return null;
    }

    const decoded = {
      magicByte: buffer.subarray(0, 1),
      registryId: buffer.subarray(1, 5).readInt32BE(),
      payload: buffer.subarray(5, buffer.length),
    };

    if (
      Buffer.compare(MagicByteSerializer.magicByte, decoded.magicByte) !== 0
    ) {
      return null;
    }

    return decoded;
  }
}
