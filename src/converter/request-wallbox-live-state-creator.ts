import {DataBuilder, Frame, FrameBuilder, FrameCreator, WBTag} from 'easy-rscp';

/** Like easy-rscp RequestWallboxLiveDataCreator, but also requests EXTERN_DATA_ALG. */
export class RequestWallboxLiveStateCreator implements FrameCreator<number[]> {
    create(ids: number[]): Frame {
        const content = ids.map(id => new DataBuilder()
            .tag(WBTag.REQ_DATA)
            .container(
                new DataBuilder().tag(WBTag.INDEX).uchar8(id).build(),
                new DataBuilder().tag(WBTag.REQ_EXTERN_DATA_SUN).build(),
                new DataBuilder().tag(WBTag.REQ_EXTERN_DATA_ALL).build(),
                new DataBuilder().tag(WBTag.REQ_EXTERN_DATA_ALG).build(),
            )
            .build());
        return new FrameBuilder()
            .addData(...content)
            .build();
    }
}