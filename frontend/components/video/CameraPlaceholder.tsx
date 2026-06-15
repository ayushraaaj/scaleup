const CameraPlaceholder = (props: any) => {
  const { fullname, className } = props;

  return (
    <div className={`${className} flex justify-center items-center`}>
      <div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-lg font-bold">
          {fullname.charAt(0).toUpperCase()}
        </div>

        <p className="mt-2 text-sm font-medium text-white">{fullname}</p>

        {/* <p className="text-xs text-gray-400">Camera Off</p> */}
      </div>
    </div>
  );
};

export default CameraPlaceholder;
