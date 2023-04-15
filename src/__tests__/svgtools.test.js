import React from 'react';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react'
import { ToolTipSvg } from '../svgtools'
import '@testing-library/jest-dom'


describe('svgtool tests', () => {
    test('Render a tooltip, check text and coordinates', () => {
        const { container } = render(
            <svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            viewBox='0 0 300 200'
            tooltip={{bounds: [[100,100], [120,120]], 
                    data: 11, feature: {properties: {NAME: 'blah!'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('blah!')).toBeInTheDocument()
        expect(screen.getByText('Data: 11')).toBeInTheDocument()
        expect(container.getElementsByTagName('text').length).toEqual(2)
        expect(container.getElementsByTagName('rect').item(0).getAttribute('width')).toEqual("120")
        expect(container.getElementsByTagName('text').item(0).getAttribute('y')).toEqual("35%")
    });

    test('Render a tooltip with 0, negative value', () => {
        render(
            <svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            viewBox='0 0 300 200'
            tooltip={{bounds: [[100,100], [120,120]], 
                    data: 0, feature: {properties: {NAME: 'testZero'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('testZero')).toBeInTheDocument()
        expect(screen.getByText('Data: 0')).toBeInTheDocument()

        render(<svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            viewBox='0 0 300 200'
            tooltip={{bounds: [[100,100], [120,120]], 
                    data: -10, feature: {properties: {NAME: 'testNeg'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('testNeg')).toBeInTheDocument()
        expect(screen.getByText('Data: -10')).toBeInTheDocument()

    });


    test('Render a tooltip with custom rect and div styles', () => {
        render(
            <svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            viewBox='0 0 300 200'
            tooltiprectstyle={{ fill: '#5c7ca7' }}
            tooltipstyle={{ fill: '#a4a4a4' }}
            tooltip_round={(n) => Math.round(n*100)/100}
            tooltip={{bounds: [[100,100], [120,120]], 
                    data: 100.543, feature: {properties: {NAME: 'Decimal'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('Data: 100.54')).toBeInTheDocument()
        expect(screen.getByText('Decimal')).toBeInTheDocument()
    });

    test('Render a tooltip out of bounds and check correction', () => {
        render(<svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            viewBox='0 0 300 200'
            tooltip={{bounds: [[280,10], [290,20]], 
                    data: 11, feature: {properties: {NAME: 'blah!'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('blah!')).toBeInTheDocument()
        expect(screen.getByText('Data: 11')).toBeInTheDocument()
    });

    test('Render a tooltip with custom data key', () => {
        render(<svg>
            <ToolTipSvg 
            key='tooltip1' width={120} height={50}
            tooltipkey='abrev'
            viewBox='0 0 300 200'
            tooltip={{bounds: [[280,10], [290,20]], 
                    data: 11, feature: {properties: {NAME: 'blah!', abrev: 'argh'}}
            }} 
            />
            </svg>) 
        expect(screen.getByText('argh')).toBeInTheDocument()
        expect(screen.getByText('Data: 11')).toBeInTheDocument()
    });


})


