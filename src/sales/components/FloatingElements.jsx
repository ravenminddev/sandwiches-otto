export default function FloatingElements({figure1, figure2, enter}){
    return(
                <div className='absolute inset-0 z-0'>
                    <img
                    src={figure1}
                    alt=""
                    draggable={false}
                    className={`absolute select-none pointer-events-none ${enter?'opacity-45':'opacity-30'} transition-all`}
                    style={{
                        left: '-3%',
                        top: '0%',
                        width: `${(120 / 900) * 100}%`,
                        transform: 'rotate(20deg)',
                        
                    }}
                    />
                    <img
                    src={figure2}
                    alt=""
                    draggable={false}
                    className={`absolute select-none pointer-events-none ${enter?'opacity-45':'opacity-30'} transition-all`}
                    style={{
                        right: '0%',
                        top: '50%',
                        width: `${(120 / 900) * 100}%`,
                        transform: 'rotate(-30deg)',
                        
                    }}
                    />
                </div>
    );
}