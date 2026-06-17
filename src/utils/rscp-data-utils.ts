import {Data, DataParser, DataType, DefaultDataParser, WBTag} from 'easy-rscp';

export function findDataByTag(
    blocks: Data[],
    tag: string,
    parser: DataParser = new DefaultDataParser(),
): Data | undefined {
    const normalizedTag = tag.toUpperCase();
    for (const block of blocks) {
        if (block.tag === normalizedTag) {
            return block;
        }
        if (block.type === DataType.CONTAINER) {
            const nested = findDataByTag(block.valueAsContainer(parser), normalizedTag, parser);
            if (nested) {
                return nested;
            }
        }
    }
    return undefined;
}

export function readTagNumber(data: Data | undefined): number | undefined {
    if (!data) {
        return undefined;
    }
    const value = data.valueAsNumber();
    if (Number.isNaN(value)) {
        return undefined;
    }
    return value;
}

export function readExternDataBuffer(
    block: Data | undefined,
    parser: DataParser = new DefaultDataParser(),
): Buffer | undefined {
    const byteBlock = block ? findDataByTag([block], WBTag.EXTERN_DATA, parser) : undefined;
    if (!byteBlock || byteBlock.size() === 0) {
        return undefined;
    }
    return Buffer.from(byteBlock.valueAsHex, 'hex');
}