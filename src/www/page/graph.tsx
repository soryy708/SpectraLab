import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Graph from '../components/graph';
import List from '../components/list';
import Button from '../components/button';
import Switch from '../components/switch';
import Toggle from '../components/toggle';
import RangeSelect from '../components/rangeSelect';
import Matrix from '../../matrix';
import corspec from '../../2dcos';

type GraphPageProps = {
    data?: Matrix;
    frequencies: number[];
};

type CorspecType = 'Φ' | 'Ψ';

const GraphPage: React.FunctionComponent<GraphPageProps> = (props: GraphPageProps) => {
    const [showLocalExtremum, setShowLocalExtremum] = useState(false);
    const [showGlobalExtremum, setShowGlobalExtremum] = useState(false);
    const [showContours, setShowContours] = useState(false);
    const [corspecType, setCorspecType] = useState<CorspecType>('Φ');
    const [dataAsΦ, setDataAsΦ] = useState<Matrix>(new Matrix([[0]]));
    const [dataAsΨ, setDataAsΨ] = useState<Matrix>(new Matrix([[0]]));
    const [frequencyRangeMin, setFrequencyRangeMin] = useState<number>(NaN);
    const [frequencyRangeMax, setFrequencyRangeMax] = useState<number>(NaN);
    const [selectedFrequency, setSelectedFrequency] = useState<number>(NaN);
    const [projection, setProjection] = useState<'perspective' | 'orthographic'>('perspective');
    const [cursor, setCursor] = useState<{x: number, y: number, z: number}>(null);
    const [data, setData] = useState<Matrix>(null);
    const [hoveredExtremum, setHoveredExtremum] = useState<{x: number, y: number}>(null);

    useEffect(() => {
        const minFreq = isNaN(frequencyRangeMin) ? props.frequencies[0] : frequencyRangeMin;
        const maxFreq = isNaN(frequencyRangeMax) ? props.frequencies[props.frequencies.length - 1] : frequencyRangeMax;
        let indexMin = props.frequencies.findIndex(freq => freq >= minFreq);
        if (indexMin === -1) {
            indexMin = 0;
        }
        let indexMax = props.frequencies.reverse().findIndex(freq => freq <= maxFreq);
        if (indexMax === -1) {
            indexMax = 0;
        }
        indexMax = Math.max(props.frequencies.length-1 - indexMax, 0);

        const dataSource: Matrix = (()=>{
            switch (corspecType) {
                case 'Φ':
                    return dataAsΦ;
                case 'Ψ':
                    return dataAsΨ;
            }
        })();

        setData(new Matrix(dataSource.toMultiDimensionalArray().map(amplitudes => amplitudes.slice(indexMin, indexMax + 1))));
    }, [corspecType, frequencyRangeMin, frequencyRangeMax, props.frequencies, dataAsΦ, dataAsΨ]);

    const [globalMaximums, globalMinimums, localExtremums] = (() => {
        if (!data) {
            return [[], [], []];
        }

        const maxVal = data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);
        const minVal = data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
        const gMax: {x: number, y: number, z: number}[] = [];
        const gMin: {x: number, y: number, z: number}[] = [];
        const locals: {x: number, y: number, z: number}[] = [];
        data.forEach((val, [x, y]) => {
            // Global extremums
            if (val === maxVal) {
                gMax.push({x, y, z: val});
                return;
            }
            if (val === minVal) {
                gMin.push({x, y, z: val});
                return;
            }
            
            // Local extremums
            const neighborIndexes = data.cardinalNeighborIndexesOf(x, y);
            const neighborVals = neighborIndexes.map(([nx, ny]) => data.getAt(nx, ny));
            const maxNeighborVal = neighborVals.reduce((max, cur) => cur > max ? cur : max, -Infinity);
            const minNeighborVal = neighborVals.reduce((min, cur) => cur < min ? cur : min,  Infinity);
            if (val > maxNeighborVal || val < minNeighborVal) {
                locals.push({x, y, z: val});
            }
        });
        return [gMax, gMin, locals];
    })();

    useEffect(() => {
        setDataAsΦ(corspec.synchronous(props.data));
        setDataAsΨ(corspec.asynchronous(props.data));
    }, [props.data]);

    return <div className="page graphPage">
        <div className="leftPart">
            <Button
                text="Φ"
                onClick={() => setCorspecType('Φ')}
            />
            <Button
                text="Ψ"
                onClick={() => setCorspecType('Ψ')}
            />

            <Toggle
                label="Show local extremum?"
                value={showLocalExtremum}
                onChange={(newVal) => setShowLocalExtremum(newVal)}
            />
            <List
                values={localExtremums}
                onRenderItem={coords => <React.Fragment>
                    x={coords.x.toFixed(1)} y={coords.y.toFixed(1)} z={coords.z.toFixed(1)}
                </React.Fragment>}
                onValueHover={value => setHoveredExtremum(value)}
                onValueHoverOut={() => setHoveredExtremum(null)}
            />
            <Toggle
                label="Show global extremum?"
                value={showGlobalExtremum}
                onChange={(newVal) => setShowGlobalExtremum(newVal)}
            />
            <List
                values={[...globalMaximums, ...globalMinimums]}
                onRenderItem={coords => <React.Fragment>
                    x={coords.x.toFixed(1)} y={coords.y.toFixed(1)} z={coords.z.toFixed(1)}
                </React.Fragment>}
                onValueHover={value => setHoveredExtremum(value)}
                onValueHoverOut={() => setHoveredExtremum(null)}
            />
            <Toggle
                label="Show contours?"
                value={showContours}
                onChange={(newVal) => setShowContours(newVal)}
            />
            <Switch
                label="Projection"
                offValue="perspective"
                onValue="orthographic"
                value={projection}
                onChange={(newVal: 'perspective' | 'orthographic') => setProjection(newVal)}
            />
            {cursor && <List
                label="Cursor:"
                values={[cursor]}
                onRenderItem={coords => <React.Fragment>
                    x={coords.x.toFixed(1)} y={coords.y.toFixed(1)} z={coords.z.toFixed(1)}
                </React.Fragment>}
            />}
            {props.frequencies.length > 0 && <div className="formElement frequenciesRange">
                <label className="label">Frequencies</label>
                <RangeSelect
                    options={props.frequencies}
                    minValue={frequencyRangeMin}
                    maxValue={frequencyRangeMax}
                    onChangeMin={newValue => setFrequencyRangeMin(newValue)}
                    onChangeMax={newValue => setFrequencyRangeMax(newValue)}
                    compare={(lval, rval) => lval - rval}
                />
            </div>}

            {props.frequencies.length > 0 && <div className="formElement">
                <label className="label">View single frequency</label>
                <select
                    value={String(selectedFrequency)}
                    onChange={e => setSelectedFrequency(Number(e.target.value))}
                >
                    <option value="NaN">No</option>
                    {props.frequencies.map(freq => <option key={freq}>{freq}</option>)}
                </select>
            </div>}
        </div>
        <div className={'rightPart ' + (isNaN(selectedFrequency) ? 'threeJsView' : 'chartJsView')}>
            {isNaN(selectedFrequency) ? (
                <Graph
                    data={data}
                    showContours={showContours}
                    projection={projection}
                    highlightedPoints={[
                        ...(showGlobalExtremum ? globalMinimums.map(coordinates => ({
                            coordinates,
                            color: 0xff0000,
                        })) : []),
                        ...(showGlobalExtremum ? globalMaximums.map(coordinates => ({
                            coordinates,
                            color: 0x00ff00,
                        })) : []),
                        ...(showLocalExtremum ? [...localExtremums, ...(!showGlobalExtremum ? [...globalMinimums, ...globalMaximums] : [])].map(coordinates => ({
                            coordinates,
                            color: 0x0000ff,
                        })) : []),
                        hoveredExtremum && {
                            coordinates: hoveredExtremum,
                            color: 0xffff00,
                            size: 0.05,
                        },
                    ]}
                    onCursor={c => setCursor(c)}
                />
            ) : (<React.Fragment>
                <p>Correlation:</p>
                <Line
                    className="lineChart"
                    type="line"
                    data={{
                        labels: props.frequencies,
                        datasets: [{
                            label: selectedFrequency,
                            fill: false,
                            borderColor: '#000',
                            tension: 0.1,
                            data: (()=>{
                                const index = props.frequencies.findIndex(freq => freq === selectedFrequency);
                                if (index === -1) {
                                    return [];
                                }
                                return data.toMultiDimensionalArray().map(amplitudes => amplitudes[index]);
                            })()
                        }],
                    }}
                />
                <p>Source:</p>
                <Line
                    className="lineChart"
                    type="line"
                    data={{
                        labels: [...Array(props.data ? props.data.getHeight() : 0).keys()],
                        datasets: [{
                            label: selectedFrequency,
                            fill: false,
                            borderColor: '#000',
                            tension: 0.1,
                            data: (()=>{
                                const index = props.frequencies.findIndex(freq => freq === selectedFrequency);
                                if (index === -1) {
                                    return [];
                                }
                                return props.data.toMultiDimensionalArray().map(amplitudes => amplitudes[index]);
                            })()
                        }],
                    }}
                />
            </React.Fragment>)}

        </div>
    </div>;
};

export default GraphPage;
