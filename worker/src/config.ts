declare type Config={
    "allowPaths":string[],
    "allowDelete": boolean,
};

export const config: Config = {
    "allowPaths": [
        "assets/",
        "images/",
    ],
    "allowDelete": true,
}