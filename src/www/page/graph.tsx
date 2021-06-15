import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Graph from '../components/graph';
import Button from '../components/button';
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

    const data = (() => {
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

        switch (corspecType) {
            case 'Φ':
                return new Matrix(dataAsΦ.toMultiDimensionalArray().map(amplitudes => amplitudes.slice(indexMin, indexMax + 1)));
            case 'Ψ':
                return new Matrix(dataAsΨ.toMultiDimensionalArray().map(amplitudes => amplitudes.slice(indexMin, indexMax + 1)));
        }
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
            <Toggle
                label="Show global extremum?"
                value={showGlobalExtremum}
                onChange={(newVal) => setShowGlobalExtremum(newVal)}
            />
            <Toggle
                label="Show contours?"
                value={showContours}
                onChange={(newVal) => setShowContours(newVal)}
            />
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
                    showLocalExtremum={showLocalExtremum}
                    showGlobalExtremum={showGlobalExtremum}
                    showContours={showContours}
                />
            ) : (
                <Line
                    className="lineChart"
                    type="line"
                    data={{
                        labels: [...Array(props.data.getHeight()).keys()],
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
                                switch (corspecType) {
                                    case 'Φ':
                                        return dataAsΦ.toMultiDimensionalArray().map(amplitudes => amplitudes[index]);
                                    case 'Ψ':
                                        return dataAsΨ.toMultiDimensionalArray().map(amplitudes => amplitudes[index]);
                                }
                            })()
                        }],
                    }}
                />
            )}

        </div>
    </div>;
};

export default GraphPage;
